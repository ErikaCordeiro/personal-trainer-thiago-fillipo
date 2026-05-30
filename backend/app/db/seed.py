import secrets
from datetime import date

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models.exercise import Exercise
from app.models.progress import ProgressLog
from app.models.student import Student
from app.models.user import User, UserRole
from app.models.video import Video
from app.models.workout import Workout, WorkoutExercise


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        is_production = settings.ENVIRONMENT.lower() == "production"
        personal_email = settings.SEED_PERSONAL_EMAIL
        personal_password = settings.SEED_PERSONAL_PASSWORD
        student_email = settings.SEED_STUDENT_EMAIL
        student_password = settings.SEED_STUDENT_PASSWORD

        legacy_personal = db.scalar(select(User).where(User.email == "thiago@personal.com"))
        if is_production and legacy_personal and not personal_password:
            legacy_personal.hashed_password = hash_password(secrets.token_urlsafe(48))
            db.commit()
            return

        if not personal_email or not personal_password:
            return

        existing = db.scalar(select(User).where(User.email == personal_email)) or legacy_personal
        if existing:
            existing.email = personal_email
            existing.name = "Thiago Fillipo"
            existing.hashed_password = hash_password(personal_password)
            db.commit()
            return

        personal = User(
            name="Thiago Fillipo",
            email=personal_email,
            hashed_password=hash_password(personal_password),
            role=UserRole.PERSONAL,
        )
        db.add(personal)
        db.flush()

        student_user = None
        if student_email and student_password:
            student_user = User(
                name="Rafael Martins",
                email=student_email,
                hashed_password=hash_password(student_password),
                role=UserRole.STUDENT,
            )
            db.add(student_user)
            db.flush()

        student = Student(
            personal_id=personal.id,
            user_id=student_user.id if student_user else None,
            name="Rafael Martins",
            email="rafael@email.com",
            age=34,
            weight=86,
            height=1.82,
            objective="Hipertrofia limpa",
            notes="Histórico de lombalgia leve. Priorizar técnica e mobilidade.",
        )
        db.add(student)
        db.flush()

        exercise = Exercise(
            personal_id=personal.id,
            name="Supino reto com barra",
            muscle_group="Peito",
            explanation="Escápulas retraídas, pés firmes e controle total na descida.",
        )
        db.add(exercise)
        db.flush()

        db.add(
            Video(
                exercise_id=exercise.id,
                title="Execução do supino reto",
                provider="youtube",
                url="https://www.youtube.com/watch?v=rT7DgCr-3pg",
                embed_url="https://www.youtube.com/embed/rT7DgCr-3pg",
            )
        )

        workout = Workout(
            personal_id=personal.id,
            student_id=student.id,
            name="Força Superior A",
            focus="Peito, costas e core",
            duration_minutes=58,
            notes="Priorizar cadência e técnica.",
        )
        db.add(workout)
        db.flush()

        db.add(
            WorkoutExercise(
                workout_id=workout.id,
                exercise_id=exercise.id,
                order_index=1,
                sets=4,
                repetitions="8-10",
                rest_seconds=90,
                load=82,
                notes="Aumentar carga apenas se a execução estiver limpa.",
            )
        )
        db.add(
            ProgressLog(
                student_id=student.id,
                workout_id=workout.id,
                exercise_id=exercise.id,
                log_date=date.today(),
                completed_exercises=1,
                load=82,
                body_weight=86,
                notes="Primeiro treino concluído com boa percepção de esforço.",
            )
        )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
