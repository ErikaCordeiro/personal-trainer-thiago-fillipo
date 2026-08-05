import time
import uuid
from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from starlette import status

from app.core.config import settings
from app.core.errors import DomainError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.student import Student
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


def _ensure_seed_user(db: Session, email: str, password: str, user: User | None) -> User | None:
    owner_email = (settings.OWNER_INITIAL_EMAIL or "").strip().lower()
    owner_password = (settings.OWNER_INITIAL_PASSWORD or "").strip()
    if (
        settings.OWNER_FORCE_PASSWORD_RESET
        and user
        and user.role == UserRole.OWNER
        and email == owner_email
        and password == owner_password
    ):
        user.hashed_password = hash_password(owner_password)
        user.is_active = True
        user.account_status = "active"
        user.must_change_password = True
        db.commit()
        db.refresh(user)
        print(f"[auth] owner temporary access repaired during login: {owner_email}")
        return user

    seed_password = (settings.SEED_PERSONAL_PASSWORD or "").strip()
    seed_email = (settings.SEED_PERSONAL_EMAIL or DEFAULT_PERSONAL_EMAIL).strip().lower()
    if email == seed_email and seed_password and password == seed_password:
        if user:
            user.name = "Thiago Fillipo"
            user.email = seed_email
            user.hashed_password = hash_password(seed_password)
            user.role = UserRole.PERSONAL
            user.is_active = True
            print(f"[auth] seeded personal user refreshed during login: {seed_email}")
        else:
            user = User(
                name="Thiago Fillipo",
                email=seed_email,
                hashed_password=hash_password(seed_password),
                role=UserRole.PERSONAL,
                is_active=True,
            )
            db.add(user)
            print(f"[auth] seeded personal user created during login: {seed_email}")
        db.commit()
        db.refresh(user)
        return user

    student_password = (settings.SEED_STUDENT_PASSWORD or "").strip()
    student_email = (settings.SEED_STUDENT_EMAIL or "").strip().lower()
    if email == student_email and student_password and password == student_password:
        if user:
            user.name = DEFAULT_STUDENT_NAME
            user.email = student_email
            user.hashed_password = hash_password(student_password)
            user.role = UserRole.STUDENT
            user.is_active = True
            print(f"[auth] seeded student user refreshed during login: {student_email}")
        else:
            user = User(
                name=DEFAULT_STUDENT_NAME,
                email=student_email,
                hashed_password=hash_password(student_password),
                role=UserRole.STUDENT,
                is_active=True,
            )
            db.add(user)
            db.flush()
            print(f"[auth] seeded student user created during login: {student_email}")

        student_profile = db.scalar(select(Student).where(Student.user_id == user.id))
        if not student_profile:
            personal_email = (settings.SEED_PERSONAL_EMAIL or DEFAULT_PERSONAL_EMAIL).strip().lower()
            personal = db.scalar(select(User).where(func.lower(User.email) == personal_email))
            if personal:
                existing_profile = db.scalar(select(Student).where(func.lower(Student.email) == student_email))
                if existing_profile:
                    existing_profile.personal_id = personal.id
                    existing_profile.user_id = user.id
                    existing_profile.name = DEFAULT_STUDENT_NAME
                    existing_profile.email = student_email
                    existing_profile.age = existing_profile.age or 28
                    existing_profile.weight = existing_profile.weight or 67.4
                    existing_profile.height = existing_profile.height or 1.68
                    existing_profile.objective = existing_profile.objective or "Hipertrofia"
                    print("[auth] seeded student profile linked during login")
                else:
                    db.add(
                        Student(
                            personal_id=personal.id,
                            user_id=user.id,
                            name=DEFAULT_STUDENT_NAME,
                            email=student_email,
                            age=28,
                            weight=67.4,
                            height=1.68,
                            objective="Hipertrofia",
                            notes="Perfil seed de teste liberado automaticamente.",
                        )
                    )
                    print("[auth] seeded student profile created during login")
        db.commit()
        db.refresh(user)
        return user
    return user


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
    password = payload.password.strip()
    user = db.scalar(select(User).where(func.lower(User.email) == email))
    print(
        "[auth] login_attempt "
        f"email={email}; "
        f"user_found={bool(user)}; "
        f"password_len={len(password)}"
    )

    if _is_locked(email):
        print(f"[auth] login_failed email={email}; reason=locked")
        raise DomainError("Muitas tentativas. Aguarde alguns minutos e tente novamente.", status.HTTP_429_TOO_MANY_REQUESTS)

    user = _ensure_seed_user(db, email, password, user)

    if not user or not verify_password(password, user.hashed_password):
        _register_failure(email)
        print(f"[auth] login_failed email={email}; reason=invalid_credentials")
        raise DomainError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)
    if not user.is_active or user.deleted_at is not None or user.account_status != "active":
        print(f"[auth] login_failed email={email}; reason=inactive_user")
        raise DomainError("Inactive user", status.HTTP_403_FORBIDDEN)

    _register_success(email, user)
    if user.role == UserRole.OWNER:
        db.add(AuditLog(actor_user_id=user.id, action="owner_login", entity_type="user", entity_id=str(user.id), details={}))
    db.commit()
    refresh_token = build_refresh_token(user) if payload.keep_connected else None
    return build_token_response(user), refresh_token


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
