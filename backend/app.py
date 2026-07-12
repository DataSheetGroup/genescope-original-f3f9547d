import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy import text

from config import Config
from models import db
import auth
import predict
import user_data


ACCESS_DEFAULT_STATEMENTS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'pending'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'pending'",
    "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'pending'",
    "ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending'",
    """
    CREATE OR REPLACE FUNCTION public.force_new_user_pending()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        NEW.role := 'pending';
        NEW.status := 'pending';
        RETURN NEW;
    END;
    $$
    """,
    "DROP TRIGGER IF EXISTS users_force_pending_on_insert ON users",
    """
    CREATE TRIGGER users_force_pending_on_insert
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION public.force_new_user_pending()
    """,
]


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    Migrate(app, db)

    CORS(
        app,
        resources={r"/*": {"origins": Config.CORS_ORIGINS}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    app.register_blueprint(auth.bp)
    app.register_blueprint(predict.bp)
    app.register_blueprint(user_data.bp)

    with app.app_context():
        db.create_all()
        try:
            for statement in ACCESS_DEFAULT_STATEMENTS:
                db.session.execute(text(statement))
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            app.logger.warning("Could not sync user access defaults: %s", exc)

    @app.get("/health")
    def health():
        return jsonify({"ok": True})

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
