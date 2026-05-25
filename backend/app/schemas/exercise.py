import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ExerciseCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    muscle_group: str | None = Field(default=None, max_length=120)
    explanation: str | None = Field(default=None, max_length=4000)


class ExerciseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    muscle_group: str | None = Field(default=None, max_length=120)
    explanation: str | None = Field(default=None, max_length=4000)


class ExerciseRead(ExerciseCreate):
    id: uuid.UUID
    personal_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
