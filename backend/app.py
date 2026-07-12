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
            db.session.execute(text("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'pending'"))
            db.session.execute(text("ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending'"))
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
