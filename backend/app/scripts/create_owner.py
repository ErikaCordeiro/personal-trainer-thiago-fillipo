from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.services.owner_service import ensure_owner


def main():
    init_db()
    with SessionLocal() as db:
        owner = ensure_owner(db)
        print("[owner] account ready" if owner else "[owner] environment not configured; skipped")


if __name__ == "__main__":
    main()
