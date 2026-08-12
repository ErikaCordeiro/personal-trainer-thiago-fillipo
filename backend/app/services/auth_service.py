import time
import uuid
import secrets
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from starlette import status

from app.core.config import settings
from app.core.errors import DomainError
from app.core.observability import request_id
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate

DEFAULT_PERSONAL_EMAIL = "thiago.iron.filippo@gmail.com"
DEFAULT_STUDENT_NAME = "Erika Gomes Cordeiro"
LOCKOUT_WINDOW_SECONDS = 15 * 60
MAX_FAILED_ATTEMPTS = 5
FAILED_ATTEMPTS: dict[str, list[float]] = defaultdict(list)
REVOKED_REFRESH_JTIS: set[str] = set()
LOGIN_HISTORY: list[dict[str, str]] = []


def _normalize_owner_bootstrap_secret(value: str | None) -> str:
    """Normalize copy/paste artifacts only for the temporary owner bootstrap."""
    normalized = unicodedata.normalize("NFKC", value or "")
    return normalized.replace("\u200b", "").replace("\ufeff", "").strip()


def register_user(db: Session, payload: UserCreate) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise DomainError("Email already registered", status.HTTP_409_CONFLICT)

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _is_locked(email: str) -> bool:
    now = time.time()
    FAILED_ATTEMPTS[email] = [moment for moment in FAILED_ATTEMPTS[email] if now - moment < LOCKOUT_WINDOW_SECONDS]
    return len(FAILED_ATTEMPTS[email]) >= MAX_FAILED_ATTEMPTS


def _register_failure(email: str) -> None:
    FAILED_ATTEMPTS[email].append(time.time())


def _register_success(email: str, user: User) -> None:
    FAILED_ATTEMPTS.pop(email, None)
    LOGIN_HISTORY.append(
        {
            "user_id": str(user.id),
            "email": email,
            "role": user.role.value,
            "at": datetime.now(timezone.utc).isoformat(),
        }
    )
    del LOGIN_HISTORY[:-50]
    user.last_login_at = datetime.now(timezone.utc).replace(tzinfo=None)


def _token_payload(user: User) -> dict[str, str]:
    return {"role": user.role.value}


def build_token_response(user: User) -> TokenResponse:
    access_token = create_access_token(str(user.id), _token_payload(user))
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user,
    )


def build_refresh_token(user: User) -> str:
    return create_refresh_token(str(user.id), {**_token_payload(user), "jti": str(uuid.uuid4())})


def authenticate(db: Session, payload: LoginRequest) -> tuple[TokenResponse, str | None]:
    email = payload.email.strip().lower()
    password = payload.password
    correlation_id = request_id()
    users = db.scalars(
        select(User).where(func.lower(func.trim(User.email)) == email)
    ).all()
    user = users[0] if len(users) == 1 else None
    role = user.role.value if user else "none"
    print(
        "[auth] login_attempt "
        f"request_id={correlation_id} user_found={str(bool(user)).lower()} "
        f"user_count={len(users)} role={role} active={str(bool(user and user.is_active)).lower()} "
        f"account_status={user.account_status if user else 'none'} "
        f"password_hash_present={str(bool(user and user.hashed_password)).lower()}"
    )

    # Allow the explicitly configured one-time owner recovery to clear a stale
    # in-memory lockout. This never applies to other users.
    owner_reset_email = (settings.OWNER_INITIAL_EMAIL or "").strip().lower()
    owner_reset_password = _normalize_owner_bootstrap_secret(settings.OWNER_INITIAL_PASSWORD)
    submitted_owner_password = _normalize_owner_bootstrap_secret(password)
    owner_email_matches = bool(owner_reset_email) and secrets.compare_digest(email, owner_reset_email)
    owner_password_matches = bool(owner_reset_password) and secrets.compare_digest(
        submitted_owner_password,
        owner_reset_password,
    )
    owner_recovery_matches = (
        settings.OWNER_FORCE_PASSWORD_RESET
        and user is not None
        and len(users) == 1
        and user.role == UserRole.OWNER
        and owner_email_matches
        and owner_password_matches
    )
    if owner_email_matches or (user is not None and user.role == UserRole.OWNER):
        print(
            f"[auth] owner_recovery_check request_id={correlation_id} "
            f"force_reset={str(settings.OWNER_FORCE_PASSWORD_RESET).lower()} "
            f"email_match={str(owner_email_matches).lower()} "
            f"password_match={str(owner_password_matches).lower()} "
            f"submitted_password_len={len(password)} configured_password_len={len(owner_reset_password)}"
        )

    if _is_locked(email) and not owner_recovery_matches:
        print(f"[auth] login_failed request_id={correlation_id} reason=blocked_account")
        raise DomainError("Muitas tentativas. Aguarde alguns minutos e tente novamente.", status.HTTP_429_TOO_MANY_REQUESTS)
    if owner_recovery_matches:
        FAILED_ATTEMPTS.pop(email, None)

    if len(users) > 1:
        print(f"[auth] login_failed request_id={correlation_id} reason=internal_auth_error duplicate_accounts=true")
        raise DomainError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)
    if not user:
        _register_failure(email)
        print(f"[auth] login_failed request_id={correlation_id} reason=user_not_found")
        raise DomainError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)

    try:
        password_valid = verify_password(submitted_owner_password, user.hashed_password)
    except (TypeError, ValueError):
        password_valid = False
    # Production recovery is deliberately narrow: it only applies to the
    # configured owner while the one-time reset flag is explicitly enabled.
    # Re-hashing here makes the reset and the first successful login atomic,
    # even when a deployment starts more than one application replica.

    if not password_valid and owner_recovery_matches:
        user.hashed_password = hash_password(owner_reset_password)
        user.is_active = True
        user.account_status = "active"
        user.must_change_password = True
        password_valid = verify_password(password, user.hashed_password)
        print(
            f"[auth] owner_recovery_applied request_id={correlation_id} "
            f"password_valid={str(password_valid).lower()}"
        )
    print(f"[auth] password_verification request_id={correlation_id} password_valid={str(password_valid).lower()}")
    if not password_valid:
        _register_failure(email)
        print(f"[auth] login_failed request_id={correlation_id} reason=invalid_credentials")
        raise DomainError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)
    if user.deleted_at is not None or not user.is_active:
        print(f"[auth] login_failed request_id={correlation_id} reason=inactive_account")
        raise DomainError("Inactive user", status.HTTP_403_FORBIDDEN)
    if user.account_status != "active":
        print(f"[auth] login_failed request_id={correlation_id} reason=blocked_account")
        raise DomainError("Inactive user", status.HTTP_403_FORBIDDEN)

    print(f"[auth] credentials_valid request_id={correlation_id} role={user.role.value}")
    try:
        token_response = build_token_response(user)
        print(f"[auth] access_token_created request_id={correlation_id}")
        refresh_token = build_refresh_token(user) if payload.keep_connected else None
        print(
            f"[auth] refresh_session_created request_id={correlation_id} "
            f"persistent={str(bool(refresh_token)).lower()}"
        )
        _register_success(email, user)
        if user.role == UserRole.OWNER:
            db.add(AuditLog(actor_user_id=user.id, action="owner_login", entity_type="user", entity_id=str(user.id), details={}))
        db.commit()
    except Exception as exc:
        db.rollback()
        print(
            f"[auth] login_failed request_id={correlation_id} reason=session_creation_failed "
            f"error_type={type(exc).__name__}"
        )
        raise DomainError("Unable to create session", status.HTTP_500_INTERNAL_SERVER_ERROR) from exc
    print(f"[auth] login_success request_id={correlation_id} role={user.role.value}")
    return token_response, refresh_token


def refresh_session(db: Session, refresh_token: str) -> tuple[TokenResponse, str]:
    try:
        payload = decode_refresh_token(refresh_token)
        user_id = uuid.UUID(str(payload.get("sub")))
    except (ValueError, TypeError):
        raise DomainError("Sessão expirada. Entre novamente.", status.HTTP_401_UNAUTHORIZED)

    jti = str(payload.get("jti") or "")
    if not jti or jti in REVOKED_REFRESH_JTIS:
        raise DomainError("Sessão expirada. Entre novamente.", status.HTTP_401_UNAUTHORIZED)

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise DomainError("Sessão expirada. Entre novamente.", status.HTTP_401_UNAUTHORIZED)

    REVOKED_REFRESH_JTIS.add(jti)
    return build_token_response(user), build_refresh_token(user)


def revoke_refresh_token(refresh_token: str | None) -> None:
    if not refresh_token:
        return
    try:
        payload = decode_refresh_token(refresh_token)
    except ValueError:
        return
    jti = str(payload.get("jti") or "")
    if jti:
        REVOKED_REFRESH_JTIS.add(jti)


def get_connected_devices(user: User) -> list[dict[str, str | bool]]:
    latest = next((item for item in reversed(LOGIN_HISTORY) if item.get("user_id") == str(user.id)), None)
    return [
        {
            "device": "Sessão atual",
            "browser": "Navegador/PWA",
            "last_access": latest["at"] if latest else datetime.now(timezone.utc).isoformat(),
            "location": "Localização aproximada indisponivel",
            "current": True,
        }
    ]
