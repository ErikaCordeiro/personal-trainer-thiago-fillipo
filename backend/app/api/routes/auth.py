from fastapi import APIRouter, Cookie, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, SessionResponse, TokenResponse
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import (
    authenticate,
    authenticate_owner,
    get_connected_devices,
    refresh_session,
    register_user,
    revoke_refresh_token,
)

router = APIRouter()


def _cookie_secure() -> bool:
    return settings.ENVIRONMENT.lower() in {"production", "prod"}


def _set_refresh_cookie(response: Response, refresh_token: str | None) -> None:
    if not refresh_token:
        response.delete_cookie(settings.REFRESH_COOKIE_NAME, path="/api/auth")
        return
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth",
    )


@router.post("/register", response_model=UserRead, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    token_response, refresh_token = authenticate(db, payload)
    _set_refresh_cookie(response, refresh_token)
    return token_response


@router.post("/owner-login", response_model=TokenResponse)
def owner_login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    token_response, refresh_token = authenticate_owner(db, payload)
    _set_refresh_cookie(response, refresh_token)
    return token_response

@router.post("/refresh", response_model=SessionResponse)
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
):
    token_response, rotated_refresh = refresh_session(db, refresh_token or "")
    _set_refresh_cookie(response, rotated_refresh)
    return token_response


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
):
    revoke_refresh_token(refresh_token)
    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path="/api/auth")
    return None


@router.get("/session", response_model=UserRead)
def session(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/devices")
def devices(current_user: User = Depends(get_current_user)):
    return {"devices": get_connected_devices(current_user), "two_factor_admin_ready": current_user.role.value == "personal"}
