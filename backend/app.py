import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate

from config import Config
from models import db
import auth
import predict
import user_data


def create_app() -> Flask:
    app = Flask(__name__)
    from flask_cors import CORS
    CORS(app, origins=["https://*.netlify.app", "http://localhost:8080", "http://genescope.online/", "http://www.genescope.online/", "genescope.online", "www.genescope.online", "https://genescope.online/", "https://www.genescope.online/"], supports_credentials=True)
    app.config.from_object(Config)

    db.init_app(app)
    Migrate(app, db)

    CORS(
        app,
        resources={r"/*": {"origins": Config.CORS_ORIGINS}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    app.register_blueprint(auth.bp)
    app.register_blueprint(predict.bp)
    app.register_blueprint(user_data.bp)

    with app.app_context():
        db.create_all()

    @app.get("/health")
    def health():
        return jsonify({"ok": True})

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
