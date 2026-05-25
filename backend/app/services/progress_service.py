from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.progress import ProgressLog
from app.models.user import User
from app.schemas.progress import ProgressLogCreate
from app.services.access import get_owned_student


def list_progress(db: Session, current_user: User, student_id) -> list[ProgressLog]:
    get_owned_student(db, student_id, current_user)
    return list(db.scalars(select(ProgressLog).where(ProgressLog.student_id == student_id).order_by(ProgressLog.log_date.desc())))


def create_progress(db: Session, current_user: User, payload: ProgressLogCreate) -> ProgressLog:
    get_owned_student(db, payload.student_id, current_user)
    progress = ProgressLog(**payload.model_dump())
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress
