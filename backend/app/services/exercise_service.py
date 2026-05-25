import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette import status

from app.core.errors import DomainError
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate


def list_exercises(db: Session, personal: User) -> list[Exercise]:
    return list(db.scalars(select(Exercise).where(Exercise.personal_id == personal.id).order_by(Exercise.name)))


def create_exercise(db: Session, personal: User, payload: ExerciseCreate) -> Exercise:
    exercise = Exercise(personal_id=personal.id, **payload.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


def update_exercise(db: Session, personal: User, exercise_id: uuid.UUID, payload: ExerciseUpdate) -> Exercise:
    exercise = db.get(Exercise, exercise_id)
    if not exercise or exercise.personal_id != personal.id:
        raise DomainError("Exercise not found", status.HTTP_404_NOT_FOUND)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(exercise, field, value)
    db.commit()
    db.refresh(exercise)
    return exercise
