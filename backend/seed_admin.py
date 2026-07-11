"""Create the first developer/admin account.

Usage:
    cd backend
    python seed_admin.py you@datasheetgroup.com YourStrongPassword "Your Name"
"""
import sys
from app import create_app
from auth import hash_password
from models import User, db


def main():
    if len(sys.argv) < 3:
        print("Usage: python seed_admin.py <email> <password> [full_name]")
        sys.exit(1)
    email = sys.argv[1].lower()
    password = sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else None

    app = create_app()
    with app.app_context():
        db.create_all()
        if User.query.filter_by(email=email).first():
            print(f"User {email} already exists.")
            return
        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role="developer",
        )
        db.session.add(user)
        db.session.commit()
        print(f"Created developer account: {email}")


if __name__ == "__main__":
    main()
