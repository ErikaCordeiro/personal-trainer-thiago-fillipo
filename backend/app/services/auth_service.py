from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette import status

from app.core.errors import DomainError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate


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
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise DomainError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        raise DomainError("Inactive user", status.HTTP_403_FORBIDDEN)

    token = create_access_token(str(user.id), {"role": user.role.value})
    return TokenResponse(access_token=token)
