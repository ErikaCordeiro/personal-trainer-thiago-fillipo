from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    keep_connected: bool = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead | None = None


class SessionResponse(TokenResponse):
    pass


class RequiredPasswordChange(BaseModel):
    new_password: str = Field(min_length=10, max_length=128)
    confirm_password: str = Field(min_length=10, max_length=128)
