from datetime import datetime, timedelta
from functools import wraps
import secrets

import bcrypt
import jwt
from flask import Blueprint, current_app, jsonify, request

from config import Config
from models import PasswordReset, User, db

bp = Blueprint("auth", __name__, url_prefix="/auth")


# ---------- helpers ----------

def hash_password(pw: str) -> bytes:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt())


def verify_password(pw: str, pw_hash: bytes) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), pw_hash)
    except Exception:
        return False


def issue_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRES_HOURS),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def decode_token(token: str):
    return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        try:
            payload = decode_token(auth.split(" ", 1)[1])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        user = db.session.get(User, payload["sub"])
        if not user or not user.is_active:
            return jsonify({"error": "Inactive user"}), 401
        request.user = user
        return fn(*args, **kwargs)

    return wrapper


# ---------- routes ----------

@bp.post("/register")
def register():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip() or None

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if not Config.email_allowed(email):
        return jsonify({"error": "This email is not authorized to register"}), 403
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(email=email, password_hash=hash_password(password), full_name=full_name)
    db.session.add(user)
    db.session.commit()

    token = issue_token(user)
    return jsonify({"access_token": token, "user": user.to_public()}), 201


@bp.post("/login")
def login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.is_active:
        return jsonify({"error": "Account disabled"}), 403
    if not Config.email_allowed(email):
        return jsonify({"error": "This account is no longer authorized"}), 403

    user.last_login_at = datetime.utcnow()
    db.session.commit()

    token = issue_token(user)
    return jsonify({"access_token": token, "user": user.to_public()})


@bp.get("/me")
@require_auth
def me():
    return jsonify({"user": request.user.to_public()})


@bp.post("/logout")
@require_auth
def logout():
    # Stateless JWT: client discards token. Endpoint exists for symmetry.
    return jsonify({"ok": True})


@bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()
    # Always return ok to avoid user enumeration.
    if user:
        token = secrets.token_urlsafe(48)
        pr = PasswordReset(
            user_id=user.id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )
        db.session.add(pr)
        db.session.commit()
        # TODO: send email with reset link containing `token`.
        current_app.logger.info("Password reset token for %s: %s", email, token)
    return jsonify({"ok": True})


@bp.post("/reset-password")
def reset_password():
    data = request.get_json(force=True) or {}
    token = data.get("token") or ""
    new_password = data.get("password") or ""
    if len(new_password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    pr = PasswordReset.query.filter_by(token=token, used=False).first()
    if not pr or pr.expires_at < datetime.utcnow():
        return jsonify({"error": "Invalid or expired token"}), 400

    user = db.session.get(User, pr.user_id)
    user.password_hash = hash_password(new_password)
    pr.used = True
    db.session.commit()
    return jsonify({"ok": True})
