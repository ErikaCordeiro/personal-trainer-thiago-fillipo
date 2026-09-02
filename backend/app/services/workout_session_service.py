from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.models.student import Student
from app.models.user import User, UserRole
from app.models.workout_session import ProgressionAlert, WorkoutSession
from app.schemas.workout_session import WorkoutSessionUpsert


ACTIVE_STATUSES = {"nao_iniciado", "em_andamento", "pausado"}
FINISHED_STATUSES = {"concluido", "incompleto"}


def _student_for_user(db: Session, user: User) -> Student:
    student = db.scalar(select(Student).where(Student.user_id == user.id))
    if not student:
        raise DomainError("Student profile not found", 404)
    return student


def _query_for_user(db: Session, user: User):
    query = select(WorkoutSession)
    if user.role == UserRole.STUDENT:
        student = _student_for_user(db, user)
        return query.where(WorkoutSession.student_id == student.id)
    return query.where(WorkoutSession.personal_id == user.id)


def list_history(db: Session, user: User) -> list[WorkoutSession]:
    query = _query_for_user(db, user).where(WorkoutSession.status.in_(FINISHED_STATUSES)).order_by(WorkoutSession.completed_at.desc())
    return list(db.scalars(query))


def get_active(db: Session, user: User, workout_ref: str | None = None) -> WorkoutSession | None:
    query = _query_for_user(db, user).where(WorkoutSession.status.in_(ACTIVE_STATUSES))
    if workout_ref:
        query = query.where(WorkoutSession.workout_ref == workout_ref)
    return db.scalar(query.order_by(WorkoutSession.updated_at.desc()))


def upsert_session(db: Session, user: User, payload: WorkoutSessionUpsert) -> WorkoutSession:
    student = _student_for_user(db, user) if user.role == UserRole.STUDENT else None
    if not student:
        raise DomainError("Only students can save workout execution", 403)
    current = db.scalar(select(WorkoutSession).where(
        WorkoutSession.student_id == student.id,
        WorkoutSession.client_session_id == payload.client_session_id,
    ))
    values = payload.model_dump(exclude={"client_updated_at"})
    values["exercises"] = [item.model_dump(mode="json") for item in payload.exercises]
    incoming_time = payload.client_updated_at
    if incoming_time.tzinfo is None:
        incoming_time = incoming_time.replace(tzinfo=timezone.utc)
    if current:
        saved_time = current.client_updated_at
        if saved_time.tzinfo is None:
            saved_time = saved_time.replace(tzinfo=timezone.utc)
        if incoming_time < saved_time:
            return current
        for field, value in values.items():
            setattr(current, field, value)
        current.client_updated_at = incoming_time
        current.version += 1
    else:
        current = WorkoutSession(
            **values,
            client_updated_at=incoming_time,
            student_id=student.id,
            personal_id=student.personal_id,
        )
        db.add(current)
    db.commit()
    db.refresh(current)
    return current


def delete_active(db: Session, user: User, session_id) -> None:
    session = db.get(WorkoutSession, session_id)
    student = _student_for_user(db, user)
    if not session or session.student_id != student.id or session.status not in ACTIVE_STATUSES:
        raise DomainError("Active workout not found", 404)
    db.delete(session)
    db.commit()


def latest_performance(db: Session, user: User, exercise_ref: str) -> dict | None:
    for session in list_history(db, user):
        for exercise in session.exercises or []:
            if str(exercise.get("exercise_id")) != exercise_ref:
                continue
            completed = [item for item in exercise.get("sets", []) if item.get("status") == "concluida"]
            if completed:
                item = completed[-1]
                return {"exercise_id": exercise_ref, "used_load": item.get("used_load"), "completed_reps": item.get("completed_reps"), "completed_at": session.completed_at}
    return None


def progression_alerts(db: Session, user: User) -> list[ProgressionAlert]:
    student = _student_for_user(db, user)
    history = list_history(db, user)
    samples = {}
    for session in reversed(history):
        if not session.completed_at:
            continue
        for exercise in session.exercises or []:
            loads = [float(item["used_load"]) for item in exercise.get("sets", []) if item.get("used_load") is not None]
            if loads:
                ref = str(exercise.get("exercise_id"))
                samples.setdefault(ref, []).append((session.completed_at, max(loads), exercise.get("exercise_name") or "Exercício"))
    due = []
    now = datetime.now(timezone.utc)
    for ref, values in samples.items():
        if len(values) < 2:
            continue
        first_date, first_load, name = values[0]
        last_date, last_load, _ = values[-1]
        if first_date.tzinfo is None:
            first_date = first_date.replace(tzinfo=timezone.utc)
        if last_date.tzinfo is None:
            last_date = last_date.replace(tzinfo=timezone.utc)
        if (last_date - first_date).days < 30 or any(load > first_load for _, load, _ in values) or abs(last_load - first_load) > 0.01:
            continue
        signature = f"{first_load:.2f}:{first_date.date()}:{last_date.date()}"
        alert = db.scalar(select(ProgressionAlert).where(ProgressionAlert.student_id == student.id, ProgressionAlert.exercise_ref == ref, ProgressionAlert.kind == "load_stagnation"))
        if not alert:
            alert = ProgressionAlert(student_id=student.id, exercise_ref=ref, exercise_name=name, signature=signature, message="Você está há cerca de 1 mês utilizando a mesma carga neste exercício. Converse com seu Personal para avaliar sua progressão.")
            db.add(alert)
        elif alert.signature != signature:
            alert.signature = signature
            alert.last_notified_at = None
        if not alert.last_notified_at or now - alert.last_notified_at.replace(tzinfo=timezone.utc) >= timedelta(days=14):
            alert.last_notified_at = now
            due.append(alert)
    db.commit()
    return due
