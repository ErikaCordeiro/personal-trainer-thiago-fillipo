"""Smoke test local para isolamento de branding multi-tenant."""

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import Base
from app.models.personal_branding import PersonalBranding
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.branding import BrandingUpdate
from app.services.branding_service import FITLAND_BRANDING, get_personal_branding, personal_for_user, save_branding


def run() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        owner = User(name="Erika Cordeiro", email="owner@fitland.test", hashed_password=hash_password("OwnerTest123!"), role=UserRole.OWNER)
        thiago = User(name="Thiago Fillipo", email="thiago@fitland.test", hashed_password=hash_password("PersonalTest123!"), role=UserRole.PERSONAL)
        other = User(name="Outro Personal", email="outro@fitland.test", hashed_password=hash_password("PersonalTest123!"), role=UserRole.PERSONAL)
        student_user = User(name="Aluna Thiago", email="aluna@fitland.test", hashed_password=hash_password("StudentTest123!"), role=UserRole.STUDENT)
        other_student_user = User(name="Aluno Outro", email="aluno2@fitland.test", hashed_password=hash_password("StudentTest123!"), role=UserRole.STUDENT)
        db.add_all([owner, thiago, other, student_user, other_student_user]); db.flush()
        db.add_all([
            Student(personal_id=thiago.id, user_id=student_user.id, name=student_user.name, email=student_user.email, age=30, weight=70, height=1.65, objective="Saúde"),
            Student(personal_id=other.id, user_id=other_student_user.id, name=other_student_user.name, email=other_student_user.email, age=31, weight=80, height=1.75, objective="Força"),
        ])
        db.commit()

        save_branding(db, thiago, BrandingUpdate(display_name="Personal Thiago Fillipo", logo_url="/thiago.png", primary_color="#050505", secondary_color="#C0C0C0"))
        save_branding(db, other, BrandingUpdate(display_name="Marca Independente", logo_url="/outro.png", primary_color="#111111", secondary_color="#EEEEEE"))

        assert FITLAND_BRANDING["display_name"] == "Fitland"
        assert get_personal_branding(db, thiago)["display_name"] == "Personal Thiago Fillipo"
        assert get_personal_branding(db, other)["display_name"] == "Marca Independente"
        assert personal_for_user(db, student_user).id == thiago.id
        assert personal_for_user(db, other_student_user).id == other.id
        assert db.scalar(select(PersonalBranding).where(PersonalBranding.personal_id == thiago.id)).logo_url == "/thiago.png"
        assert db.scalar(select(User).where(User.email == "thiago@fitland.test")) is thiago
        assert db.query(User).filter(User.name == "Thiago Fillipo").count() == 1

    print("branding smoke tests: 9 checks passed")


if __name__ == "__main__":
    run()
