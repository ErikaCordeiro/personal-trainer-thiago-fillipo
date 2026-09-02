from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class TechniqueEntry(BaseModel):
    exercise_id: str
    exercise_name: str | None = None
    order: int = Field(ge=0)
    load: float | None = Field(default=None, ge=0)
    repetitions: int | None = Field(default=None, ge=0)
    completed: bool = False


class DropEntry(BaseModel):
    order: int = Field(ge=0)
    load: float | None = Field(default=None, ge=0)
    repetitions: int | None = Field(default=None, ge=0)
    completed: bool = False


class SessionSet(BaseModel):
    set_number: int = Field(ge=1)
    set_type: Literal["standard", "biset", "drop_set"] = "standard"
    status: str = "pendente"
    used_load: float | None = Field(default=None, ge=0)
    completed_reps: int | None = Field(default=None, ge=0)
    observation: str | None = Field(default=None, max_length=2000)
    components: list[TechniqueEntry] = Field(default_factory=list)
    drops: list[DropEntry] = Field(default_factory=list)
    started_at: datetime | None = None
    completed_at: datetime | None = None


class SessionExercise(BaseModel):
    exercise_id: str
    exercise_name: str | None = None
    position: int = Field(ge=0)
    status: str = "pendente"
    sets: list[SessionSet] = Field(default_factory=list)


class WorkoutSessionUpsert(BaseModel):
    client_session_id: str = Field(min_length=1, max_length=180)
    workout_ref: str = Field(min_length=1, max_length=180)
    workout_name: str = Field(min_length=1, max_length=160)
    status: str = Field(default="em_andamento", max_length=32)
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_seconds: int = Field(default=0, ge=0)
    current_exercise_id: str | None = Field(default=None, max_length=180)
    progress: dict[str, Any] = Field(default_factory=dict)
    exercises: list[SessionExercise] = Field(default_factory=list)
    feedback: dict[str, Any] | None = None
    client_updated_at: datetime


class WorkoutSessionRead(WorkoutSessionUpsert):
    id: UUID
    student_id: UUID
    personal_id: UUID
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProgressionAlertRead(BaseModel):
    id: UUID
    exercise_ref: str
    exercise_name: str
    kind: str
    message: str
    last_notified_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
