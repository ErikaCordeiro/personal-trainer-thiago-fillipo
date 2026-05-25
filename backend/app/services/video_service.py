from sqlalchemy.orm import Session
from starlette import status

from app.core.errors import DomainError
from app.models.exercise import Exercise
from app.models.user import User
from app.models.video import Video
from app.schemas.video import VideoCreate


def create_video(db: Session, personal: User, payload: VideoCreate) -> Video:
    exercise = db.get(Exercise, payload.exercise_id)
    if not exercise or exercise.personal_id != personal.id:
        raise DomainError("Exercise not found", status.HTTP_404_NOT_FOUND)
    video = Video(**payload.model_dump(mode="json"))
    db.add(video)
    db.commit()
    db.refresh(video)
    return video
