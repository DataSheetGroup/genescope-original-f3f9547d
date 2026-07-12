"""User data endpoints: prediction history, saved analyses, preferences.

All routes require auth. Rows are scoped by request.user (set by @require_auth).
"""
import json
from datetime import datetime

from flask import Blueprint, jsonify, request

from auth import require_auth
from models import db


# ---------- models (defined here to keep this blueprint self-contained) ----------

class PredictionHistory(db.Model):
    __tablename__ = "prediction_history"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    input_json = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.String(128), nullable=False)
    confidence = db.Column(db.Float, nullable=False, default=0.0)
    note = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": str(self.id),
            "timestamp": self.created_at.isoformat() + "Z",
            "input": json.loads(self.input_json or "{}"),
            "result": {"prediction": self.prediction, "confidence": self.confidence},
            "note": self.note,
        }


class UserPreference(db.Model):
    __tablename__ = "user_preferences"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    key = db.Column(db.String(128), nullable=False)
    value = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (db.UniqueConstraint("user_id", "key", name="uq_user_pref"),)


bp = Blueprint("user_data", __name__)


# ---------- history ----------

@bp.get("/history")
@require_auth
def list_history():
    items = PredictionHistory.query.filter_by(user_id=request.user.id)\
        .order_by(PredictionHistory.created_at.desc()).limit(500).all()
    return jsonify([i.to_dict() for i in items])


@bp.post("/history")
@require_auth
def add_history():
    data = request.get_json(force=True) or {}
    inp = data.get("input") or {}
    res = data.get("result") or {}
    item = PredictionHistory(
        user_id=request.user.id,
        input_json=json.dumps(inp),
        prediction=str(res.get("prediction") or "unknown"),
        confidence=float(res.get("confidence") or 0.0),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@bp.delete("/history/<int:item_id>")
@require_auth
def delete_history(item_id: int):
    item = PredictionHistory.query.filter_by(id=item_id, user_id=request.user.id).first()
    if not item:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@bp.post("/history/clear")
@require_auth
def clear_history():
    PredictionHistory.query.filter_by(user_id=request.user.id).delete()
    db.session.commit()
    return jsonify({"ok": True})


@bp.patch("/history/<int:item_id>")
@require_auth
def update_history(item_id: int):
    item = PredictionHistory.query.filter_by(id=item_id, user_id=request.user.id).first()
    if not item:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json(force=True) or {}
    if "saved" in data:
        item.saved = bool(data["saved"])
    if "note" in data:
        item.note = data["note"]
    db.session.commit()
    return jsonify(item.to_dict())


# ---------- preferences ----------

@bp.get("/preferences")
@require_auth
def get_preferences():
    rows = UserPreference.query.filter_by(user_id=request.user.id).all()
    out = {}
    for r in rows:
        try:
            out[r.key] = json.loads(r.value)
        except Exception:
            out[r.key] = r.value
    return jsonify(out)


@bp.put("/preferences")
@require_auth
def put_preferences():
    data = request.get_json(force=True) or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Body must be a JSON object"}), 400
    for k, v in data.items():
        row = UserPreference.query.filter_by(user_id=request.user.id, key=str(k)[:128]).first()
        payload = json.dumps(v)
        if row:
            row.value = payload
        else:
            db.session.add(UserPreference(user_id=request.user.id, key=str(k)[:128], value=payload))
    db.session.commit()
    return get_preferences()
