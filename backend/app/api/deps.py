import uuid

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from starlette import status

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(token)
        user_id = uuid.UUID(str(payload.get("sub")))
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

    user = db.get(User, user_id)
    if not user or not user.is_active or user.deleted_at is not None or user.account_status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or missing user")
    if int(payload.get("token_version", 0)) != int(user.token_version or 0):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session revoked")
    user._token_password_change_required = bool(payload.get("password_change_required", False))
    return user


def require_personal(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.PERSONAL:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Personal role required")
    return current_user


def require_student_or_personal(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in {UserRole.PERSONAL, UserRole.STUDENT}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid role")
    return current_user


def require_owner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required")
    if current_user.must_change_password or getattr(current_user, "_token_password_change_required", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Password change required")
    return current_user


def require_owner_password_change(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required")
    if not current_user.must_change_password:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Password change is not pending")
    return current_user
