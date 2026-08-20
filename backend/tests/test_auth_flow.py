import os
import time
import uuid
from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

from app.api.deps import require_owner, require_personal, require_student_or_personal
from app.core.config import settings
from app.core.errors import DomainError
from app.core.security import create_refresh_token, hash_password, verify_password
from app.db.session import get_db
from app.main import app
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest
from app.services import auth_service
from app.services.auth_service import authenticate, authenticate_owner, refresh_session
from app.services.owner_service import ensure_owner


PASSWORD = "ValidPass123!"


class Result:
    def __init__(self, values):
        self.values = values

    def all(self):
        return self.values


class FakeSession:
    def __init__(self, users=None):
        self.users = list(users or [])
        self.added = []
        self.commits = 0
        self.rollbacks = 0

    def scalars(self, _query):
        return Result(self.users)

    def add(self, value):
        self.added.append(value)

    def commit(self):
        self.commits += 1

    def rollback(self):
        self.rollbacks += 1

    def refresh(self, _value):
        return None

    def get(self, _model, user_id):
        return next((user for user in self.users if user.id == user_id), None)


def make_user(role=UserRole.OWNER, **changes):
    values = {
        "id": uuid.uuid4(),
        "name": "Test User",
        "email": "test@example.com",
        "hashed_password": hash_password(PASSWORD),
        "role": role,
        "is_active": True,
        "account_status": "active",
        "must_change_password": False,
        "created_at": datetime.utcnow(),
        "deleted_at": None,
        "avatar_url": None,
        "theme_preference": "auto",
    }
    values.update(changes)
    return User(**values)


@pytest.fixture(autouse=True)
def reset_auth_state():
    auth_service.FAILED_ATTEMPTS.clear()
    auth_service.REVOKED_REFRESH_JTIS.clear()
    yield
    auth_service.FAILED_ATTEMPTS.clear()
    auth_service.REVOKED_REFRESH_JTIS.clear()


def payload(email="test@example.com", password=PASSWORD, keep=True):
    return LoginRequest(email=email, password=password, keep_connected=keep)


def test_login_route_is_registered():
    assert any(route.path == "/api/auth/login" and "POST" in route.methods for route in app.routes)


def test_owner_login_route_is_registered():
    assert any(route.path == "/api/auth/owner-login" and "POST" in route.methods for route in app.routes)


def test_frontend_payload_matches_backend_schema():
    source = (Path(__file__).parents[2] / "frontend" / "src" / "services" / "api.js").read_text(encoding="utf-8")
    assert 'JSON.stringify({ email, password, keep_connected: keepConnected })' in source


def test_owner_is_found_and_authenticates():
    response, refresh = authenticate(FakeSession([make_user()]), payload())
    assert response.user.role == UserRole.OWNER
    assert refresh


def test_owner_wrong_password_is_rejected():
    with pytest.raises(DomainError) as error:
        authenticate(FakeSession([make_user()]), payload(password="WrongPass123!"))
    assert error.value.status_code == 401


def test_dedicated_owner_login_authenticates_owner(monkeypatch):
    user = make_user(hashed_password=hash_password("OldPassword123!"))
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "test@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", PASSWORD)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)

    response, refresh = authenticate_owner(db, payload())

    assert response.user.role == UserRole.OWNER
    assert refresh
    assert verify_password(PASSWORD, user.hashed_password)


def test_dedicated_owner_login_recovers_legacy_email_artifacts(monkeypatch):
    recovery_password = "RecoveryPass456!"
    user = make_user(
        email="ProgramadoraErika@gmail.com\u2060",
        hashed_password=hash_password("OldPassword123!"),
    )
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "programadoraerika@gmail.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", recovery_password)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)

    response, refresh = authenticate_owner(
        db,
        payload(
            email="programadoraerika@gmail.com",
            password=recovery_password,
        ),
    )

    assert response.user.role == UserRole.OWNER
    assert refresh
    assert user.email == "programadoraerika@gmail.com"
    assert verify_password(recovery_password, user.hashed_password)


def test_dedicated_owner_login_rejects_non_owner(monkeypatch):
    user = make_user(role=UserRole.PERSONAL)
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "test@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", PASSWORD)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)

    with pytest.raises(DomainError) as error:
        authenticate_owner(FakeSession([user]), payload())

    assert error.value.status_code == 401


def test_missing_owner_is_rejected():
    with pytest.raises(DomainError) as error:
        authenticate(FakeSession(), payload())
    assert error.value.status_code == 401


def test_inactive_owner_is_rejected():
    with pytest.raises(DomainError) as error:
        authenticate(FakeSession([make_user(is_active=False)]), payload())
    assert error.value.status_code == 403


def test_blocked_owner_is_rejected():
    with pytest.raises(DomainError) as error:
        authenticate(FakeSession([make_user(account_status="blocked")]), payload())
    assert error.value.status_code == 403


def test_must_change_password_does_not_block_initial_login():
    response, _ = authenticate(FakeSession([make_user(must_change_password=True)]), payload())
    assert response.user.must_change_password is True


def test_password_hash_round_trip():
    hashed = hash_password(PASSWORD)
    assert hashed != PASSWORD
    assert verify_password(PASSWORD, hashed)


def test_temporary_owner_reset_is_persisted_and_verifiable(monkeypatch):
    user = make_user(hashed_password=hash_password("OldPassword123!"))
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_NAME", "Owner")
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "test@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", PASSWORD)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)
    result = ensure_owner(db)
    assert result is user
    assert db.commits == 1
    assert verify_password(PASSWORD, user.hashed_password)


def test_owner_login_recovers_from_stale_hash_while_reset_is_enabled(monkeypatch):
    user = make_user(hashed_password=hash_password("OldPassword123!"))
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "test@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", PASSWORD)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)

    response, refresh = authenticate(db, payload())

    assert response.user.role == UserRole.OWNER
    assert refresh
    assert verify_password(PASSWORD, user.hashed_password)


def test_owner_recovery_clears_stale_attempt_lock(monkeypatch):
    user = make_user(hashed_password=hash_password("OldPassword123!"))
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "test@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", PASSWORD)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)
    auth_service.FAILED_ATTEMPTS[user.email] = [time.time()] * auth_service.MAX_FAILED_ATTEMPTS

    response, refresh = authenticate(db, payload())

    assert response.user.role == UserRole.OWNER
    assert refresh
    assert user.email not in auth_service.FAILED_ATTEMPTS


def test_owner_recovery_normalizes_copy_paste_artifacts(monkeypatch):
    user = make_user(hashed_password=hash_password("OldPassword123!"))
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "test@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", f"\ufeff{PASSWORD}\u200b ")
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)

    response, refresh = authenticate(db, payload())

    assert response.user.role == UserRole.OWNER
    assert refresh
    assert verify_password(PASSWORD, user.hashed_password)


def test_owner_recovery_accepts_normalized_email_and_password_atomically(monkeypatch):
    user = make_user(email="owner@example.com", hashed_password=hash_password("OldPassword123!"))
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "\ufeffOWNER@example.com\u200b ")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", f"\ufeff{PASSWORD}\u200b ")
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)

    response, refresh = authenticate(
        db,
        LoginRequest(
            email="owner@example.com",
            password=PASSWORD,
            keep_connected=True,
        ),
    )

    assert response.user.role == UserRole.OWNER
    assert refresh
    assert user.is_active is True
    assert user.account_status == "active"
    assert verify_password(PASSWORD, user.hashed_password)


def test_owner_recovery_removes_invisible_control_characters_and_wrapping_quotes(monkeypatch):
    user = make_user(email="owner@example.com", hashed_password=hash_password("OldPassword123!"))
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "owner\u2060@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", f'"{PASSWORD}\u2060"')
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)

    response, refresh = authenticate(db, payload(email="owner@example.com"))

    assert response.user.role == UserRole.OWNER
    assert refresh
    assert verify_password(PASSWORD, user.hashed_password)


def test_http_owner_recovery_uses_same_normalization_as_startup(monkeypatch):
    user = make_user(
        email="programadoraerika@gmail.com",
        hashed_password=hash_password("OldPassword123!"),
    )
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "programadoraerika@gmail.com\u2060")
    owner_password = "OwnerDeploy123!"
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", f'"{owner_password}\u2060"')
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)
    app.dependency_overrides[get_db] = lambda: db
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/login",
                json={
                    "email": "programadoraerika@gmail.com",
                    "password": owner_password,
                    "keep_connected": True,
                },
            )
        assert response.status_code == 200
        assert response.json()["user"]["role"] == "owner"
        assert settings.REFRESH_COOKIE_NAME in response.cookies
    finally:
        app.dependency_overrides.clear()


def test_http_dedicated_owner_login_creates_session(monkeypatch):
    user = make_user(
        email="programadoraerika@gmail.com",
        hashed_password=hash_password("OldPassword123!"),
    )
    db = FakeSession([user])
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "programadoraerika@gmail.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", PASSWORD)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)
    app.dependency_overrides[get_db] = lambda: db
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/owner-login",
                json={
                    "email": "programadoraerika@gmail.com",
                    "password": PASSWORD,
                    "keep_connected": True,
                },
            )
        assert response.status_code == 200
        assert response.json()["user"]["role"] == "owner"
        assert settings.REFRESH_COOKIE_NAME in response.cookies
    finally:
        app.dependency_overrides.clear()


def test_lockout_still_blocks_non_owner_recovery(monkeypatch):
    user = make_user(role=UserRole.PERSONAL)
    monkeypatch.setattr(settings, "OWNER_INITIAL_EMAIL", "test@example.com")
    monkeypatch.setattr(settings, "OWNER_INITIAL_PASSWORD", PASSWORD)
    monkeypatch.setattr(settings, "OWNER_FORCE_PASSWORD_RESET", True)
    auth_service.FAILED_ATTEMPTS[user.email] = [time.time()] * auth_service.MAX_FAILED_ATTEMPTS

    with pytest.raises(DomainError) as error:
        authenticate(FakeSession([user]), payload())

    assert error.value.status_code == 429

def test_owner_login_does_not_require_company_id():
    user = make_user()
    assert not hasattr(user, "company_id")
    response, _ = authenticate(FakeSession([user]), payload())
    assert response.user.role == UserRole.OWNER


@pytest.mark.parametrize("role", [UserRole.PERSONAL, UserRole.STUDENT])
def test_existing_roles_keep_authenticating(role):
    response, _ = authenticate(FakeSession([make_user(role=role)]), payload())
    assert response.user.role == role


def test_refresh_without_cookie_is_rejected():
    with pytest.raises(DomainError) as error:
        refresh_session(FakeSession(), "")
    assert error.value.status_code == 401


def test_valid_refresh_is_rotated():
    user = make_user()
    token = create_refresh_token(str(user.id), {"role": "owner", "jti": str(uuid.uuid4())})
    response, rotated = refresh_session(FakeSession([user]), token)
    assert response.user.id == user.id
    assert rotated != token


def test_login_still_works_after_expected_refresh_401():
    with pytest.raises(DomainError):
        refresh_session(FakeSession(), "")
    response, _ = authenticate(FakeSession([make_user()]), payload())
    assert response.user.role == UserRole.OWNER


def test_owner_rbac():
    owner = make_user()
    assert require_owner(owner) is owner
    with pytest.raises(Exception):
        require_personal(owner)


def test_personal_rbac():
    personal = make_user(role=UserRole.PERSONAL)
    assert require_personal(personal) is personal
    assert require_student_or_personal(personal) is personal


def test_student_rbac():
    student = make_user(role=UserRole.STUDENT)
    assert require_student_or_personal(student) is student
    with pytest.raises(Exception):
        require_owner(student)


def test_duplicate_normalized_accounts_are_rejected():
    with pytest.raises(DomainError) as error:
        authenticate(FakeSession([make_user(), make_user()]), payload())
    assert error.value.status_code == 401


def test_non_persistent_login_does_not_create_refresh_token():
    _, refresh = authenticate(FakeSession([make_user()]), payload(keep=False))
    assert refresh is None


def test_http_login_endpoint_creates_session_cookie():
    app.dependency_overrides[get_db] = lambda: FakeSession([make_user()])
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/login",
                json={"email": "test@example.com", "password": PASSWORD, "keep_connected": True},
            )
        assert response.status_code == 200
        assert response.json()["user"]["role"] == "owner"
        assert settings.REFRESH_COOKIE_NAME in response.cookies
        assert response.headers.get("X-Request-ID")
    finally:
        app.dependency_overrides.clear()


def test_http_invalid_login_remains_generic_401():
    app.dependency_overrides[get_db] = lambda: FakeSession()
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/login",
                json={"email": "missing@example.com", "password": PASSWORD, "keep_connected": True},
            )
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid email or password"
    finally:
        app.dependency_overrides.clear()


def test_health_exposes_safe_build_identity():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert set(response.json()) >= {"status", "service", "environment", "version", "deployment"}
