import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.db.session import Base
from app.models import *  # noqa: F401,F403
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.workout_session import WorkoutSessionUpsert
from app.services.workout_session_service import get_active, latest_performance, list_history, progression_alerts, upsert_session


@pytest.fixture()
def db():
    engine = create_engine("sqlite+pysqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def identities(db, suffix="one"):
    personal = User(id=uuid.uuid4(), name="Personal", email=f"personal-{suffix}@test.dev", hashed_password="x", role=UserRole.PERSONAL)
    user = User(id=uuid.uuid4(), name="Student", email=f"student-{suffix}@test.dev", hashed_password="x", role=UserRole.STUDENT)
    student = Student(id=uuid.uuid4(), personal_id=personal.id, user_id=user.id, name="Student", email=user.email, age=30, weight=70, height=170, objective="Teste")
    db.add_all([personal, user, student])
    db.commit()
    return personal, user, student


def payload(client="session-1", updated=None, status="em_andamento", completed=None, set_type="standard", components=None, drops=None, load=20, reps=10):
    return WorkoutSessionUpsert.model_validate({
        "client_session_id": client, "workout_ref": "workout-a", "workout_name": "Treino A", "status": status,
        "started_at": (updated or datetime.now(timezone.utc)).isoformat(), "completed_at": completed,
        "duration_seconds": 300, "current_exercise_id": "exercise-a", "progress": {"current_set_number": 1},
        "exercises": [{"exercise_id": "exercise-a", "exercise_name": "Supino", "position": 1, "status": "concluido" if status == "concluido" else "em_andamento", "sets": [{
            "set_number": 1, "set_type": set_type, "status": "concluida", "used_load": load, "completed_reps": reps,
            "components": components or [], "drops": drops or []
        }]}], "client_updated_at": (updated or datetime.now(timezone.utc)).isoformat()
    })


def test_start_save_restore_and_latest_performance(db):
    _, user, _ = identities(db)
    saved = upsert_session(db, user, payload())
    assert saved.version == 1
    assert get_active(db, user).client_session_id == "session-1"
    assert latest_performance(db, user, "exercise-a") is None


def test_last_user_change_wins(db):
    _, user, _ = identities(db)
    newer = datetime.now(timezone.utc)
    saved = upsert_session(db, user, payload(updated=newer, load=30))
    stale = upsert_session(db, user, payload(updated=newer - timedelta(seconds=5), load=10))
    assert stale.version == saved.version
    assert stale.exercises[0]["sets"][0]["used_load"] == 30


def test_finish_creates_history_with_latest_load_and_reps(db):
    _, user, _ = identities(db)
    completed = datetime.now(timezone.utc)
    saved = upsert_session(db, user, payload(status="concluido", completed=completed, load=42.5, reps=8))
    assert list_history(db, user)[0].id == saved.id
    latest = latest_performance(db, user, "exercise-a")
    assert latest["used_load"] == 42.5
    assert latest["completed_reps"] == 8


def test_biset_and_dynamic_drop_are_structurally_persisted(db):
    _, user, _ = identities(db)
    components = [{"exercise_id": f"part-{index}", "exercise_name": f"Parte {index}", "order": index, "load": 10 + index, "repetitions": 12, "completed": True} for index in range(3)]
    biset = upsert_session(db, user, payload(client="biset", set_type="biset", components=components))
    assert len(biset.exercises[0]["sets"][0]["components"]) == 3
    drops = [{"order": index, "load": 30 - index * 5, "repetitions": 8 + index, "completed": True} for index in range(4)]
    drop = upsert_session(db, user, payload(client="drop", set_type="drop_set", drops=drops))
    assert len(drop.exercises[0]["sets"][0]["drops"]) == 4


def test_edit_completed_session_updates_structured_history(db):
    _, user, _ = identities(db)
    completed = datetime.now(timezone.utc)
    upsert_session(db, user, payload(status="concluido", completed=completed, load=20))
    edited = upsert_session(db, user, payload(updated=datetime.now(timezone.utc) + timedelta(seconds=1), status="concluido", completed=completed, load=25))
    assert edited.version == 2
    assert latest_performance(db, user, "exercise-a")["used_load"] == 25


def test_sessions_are_isolated_between_students(db):
    _, first, _ = identities(db, "first")
    _, second, _ = identities(db, "second")
    upsert_session(db, first, payload(client="private"))
    assert get_active(db, second) is None
    assert list_history(db, second) == []


def test_progression_alert_requires_30_days_and_avoids_duplicates(db):
    _, user, _ = identities(db)
    start = datetime.now(timezone.utc) - timedelta(days=35)
    upsert_session(db, user, payload(client="old", updated=start, status="concluido", completed=start, load=20))
    now = datetime.now(timezone.utc)
    upsert_session(db, user, payload(client="new", updated=now, status="concluido", completed=now, load=20))
    assert len(progression_alerts(db, user)) == 1
    assert progression_alerts(db, user) == []


def test_progression_alert_is_not_created_with_insufficient_history(db):
    _, user, _ = identities(db)
    now = datetime.now(timezone.utc)
    upsert_session(db, user, payload(status="concluido", completed=now, load=20))
    assert progression_alerts(db, user) == []
