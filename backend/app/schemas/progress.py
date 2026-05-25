import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class ProgressLogCreate(BaseModel):
    student_id: uuid.UUID
    workout_id: uuid.UUID | None = None
    exercise_id: uuid.UUID | None = None
    log_date: date
    completed_exercises: int = Field(default=0, ge=0)
    load: float | None = Field(default=None, ge=0)
    body_weight: float | None = Field(default=None, gt=30, lt=300)
    notes: str | None = Field(default=None, max_length=3000)


class ProgressLogRead(ProgressLogCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
