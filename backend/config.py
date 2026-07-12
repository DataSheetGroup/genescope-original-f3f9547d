import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    _raw_db_url = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/genescope"
    )
    # Render/Neon sometimes give the old "postgres://" scheme — SQLAlchemy needs "postgresql://"
    if _raw_db_url.startswith("postgres://"):
        _raw_db_url = _raw_db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "12"))
    JWT_REMEMBER_EXPIRES_HOURS = int(os.getenv("JWT_REMEMBER_EXPIRES_HOURS", "720"))
    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",")
        if o.strip()
    ]
    MODEL_PATH = os.getenv("MODEL_PATH", "")
