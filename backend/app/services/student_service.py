import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate, StudentUpdate
from app.services.access import get_owned_student


def list_students(db: Session, personal: User) -> list[Student]:
    return list(db.scalars(select(Student).where(Student.personal_id == personal.id).order_by(Student.created_at.desc())))


def create_student(db: Session, personal: User, payload: StudentCreate) -> Student:
    student = Student(
        personal_id=personal.id,
        user_id=payload.user_id,
        name=payload.name.strip(),
        email=payload.email.lower(),
        age=payload.age,
        weight=payload.weight,
        height=payload.height,
        objective=payload.objective.strip(),
        notes=payload.notes,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def update_student(db: Session, personal: User, student_id: uuid.UUID, payload: StudentUpdate) -> Student:
    student = get_owned_student(db, student_id, personal)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value.lower() if field == "email" else value)
    db.commit()
    db.refresh(student)
    return student
