from sqlalchemy import func, select
from sqlalchemy.orm import Session
from starlette import status

from app.core.config import settings
from app.core.errors import DomainError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate

DEFAULT_PERSONAL_EMAIL = "thiago.iron.filippo@gmail.com"


def register_user(db: Session, payload: UserCreate) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise DomainError("Email already registered", status.HTTP_409_CONFLICT)

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, payload: LoginRequest) -> TokenResponse:
    email = payload.email.strip().lower()
    password = payload.password.strip()
    user = db.scalar(select(User).where(func.lower(User.email) == email))
    print(
        "[auth] login_attempt "
        f"email={email}; "
        f"user_found={bool(user)}; "
        f"password_len={len(password)}"
    )
    seed_password = (settings.SEED_PERSONAL_PASSWORD or "").strip()
    seed_email = (settings.SEED_PERSONAL_EMAIL or DEFAULT_PERSONAL_EMAIL).strip().lower()
    if email == seed_email and seed_password and password == seed_password:
        if user:
            user.name = "Thiago Filippo"
            user.email = seed_email
            user.hashed_password = hash_password(seed_password)
            user.role = UserRole.PERSONAL
            user.is_active = True
            print(f"[auth] seeded personal user refreshed during login: {seed_email}")
        else:
            user = User(
                name="Thiago Filippo",
                email=seed_email,
                hashed_password=hash_password(seed_password),
                role=UserRole.PERSONAL,
                is_active=True,
            )
            db.add(user)
            print(f"[auth] seeded personal user created during login: {seed_email}")
        db.commit()
        db.refresh(user)

    if not user or not verify_password(password, user.hashed_password):
        print(f"[auth] login_failed email={email}; reason=invalid_credentials")
        raise DomainError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        print(f"[auth] login_failed email={email}; reason=inactive_user")
        raise DomainError("Inactive user", status.HTTP_403_FORBIDDEN)

    token = create_access_token(str(user.id), {"role": user.role.value})
    return TokenResponse(access_token=token)
