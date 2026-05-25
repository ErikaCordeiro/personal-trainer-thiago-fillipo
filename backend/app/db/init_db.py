from app.db.session import Base, engine
from app.models import exercise, progress, student, user, video, workout  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
