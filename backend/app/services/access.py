import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette import status

from app.core.errors import DomainError
from app.models.student import Student
from app.models.user import User, UserRole
from app.models.workout import Workout


def get_owned_student(db: Session, student_id: uuid.UUID, current_user: User) -> Student:
    student = db.get(Student, student_id)
    if not student:
        raise DomainError("Student not found", status.HTTP_404_NOT_FOUND)

    if current_user.role == UserRole.PERSONAL and student.personal_id == current_user.id:
        return student
    if current_user.role == UserRole.STUDENT and student.user_id == current_user.id:
        return student

    raise DomainError("Forbidden resource", status.HTTP_403_FORBIDDEN)


def get_owned_workout(db: Session, workout_id: uuid.UUID, current_user: User) -> Workout:
    workout = db.get(Workout, workout_id)
    if not workout:
        raise DomainError("Workout not found", status.HTTP_404_NOT_FOUND)

    if current_user.role == UserRole.PERSONAL and workout.personal_id == current_user.id:
        return workout
    if current_user.role == UserRole.STUDENT:
        owns_student = db.scalar(
            select(Student).where(Student.id == workout.student_id, Student.user_id == current_user.id)
        )
        if owns_student:
            return workout

    raise DomainError("Forbidden resource", status.HTTP_403_FORBIDDEN)
