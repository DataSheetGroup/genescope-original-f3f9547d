import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/genescope"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "12"))
    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",")
        if o.strip()
    ]
    ALLOWED_EMAILS = [
        e.strip().lower()
        for e in os.getenv("ALLOWED_EMAILS", "").split(",")
        if e.strip()
    ]
    MODEL_PATH = os.getenv("MODEL_PATH", "")

    @staticmethod
    def email_allowed(email: str) -> bool:
        if not Config.ALLOWED_EMAILS:
            return True  # if no allowlist configured, allow all (dev only)
        email = (email or "").lower()
        for rule in Config.ALLOWED_EMAILS:
            if rule.startswith("@") and email.endswith(rule):
                return True
            if rule == email:
                return True
        return False
