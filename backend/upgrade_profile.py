"""One-time helper to add the profile columns introduced for the /profile page.

Run once from the backend folder with your virtualenv activated:

    python upgrade_profile.py

Safe to run multiple times — each ALTER uses IF NOT EXISTS.
"""
from sqlalchemy import text

from app import create_app
from models import db


STATEMENTS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(64)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'pending'",
    "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'pending'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'pending'",
    "ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW() NOT NULL",
]


def main() -> None:
    app = create_app()
    with app.app_context():
        with db.engine.begin() as conn:
            for stmt in STATEMENTS:
                print(f"-> {stmt}")
                conn.execute(text(stmt))
        print("Done. Profile columns are ready.")


if __name__ == "__main__":
    main()
