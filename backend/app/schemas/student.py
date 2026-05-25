import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class StudentBase(BaseModel):
    name: str = Field(min_length=2, max_length=140)
    email: EmailStr
    age: int = Field(ge=12, le=100)
    weight: float = Field(gt=30, lt=300)
    height: float = Field(gt=1.0, lt=2.5)
    objective: str = Field(min_length=2, max_length=255)
    notes: str | None = Field(default=None, max_length=3000)


class StudentCreate(StudentBase):
    user_id: uuid.UUID | None = None


class StudentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=140)
    email: EmailStr | None = None
    age: int | None = Field(default=None, ge=12, le=100)
    weight: float | None = Field(default=None, gt=30, lt=300)
    height: float | None = Field(default=None, gt=1.0, lt=2.5)
    objective: str | None = Field(default=None, min_length=2, max_length=255)
    notes: str | None = Field(default=None, max_length=3000)


class StudentRead(StudentBase):
    id: uuid.UUID
    personal_id: uuid.UUID
    user_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}
