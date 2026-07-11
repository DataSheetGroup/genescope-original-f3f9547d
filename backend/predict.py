import os
from flask import Blueprint, jsonify, request

from auth import require_auth
from config import Config

bp = Blueprint("predict", __name__, url_prefix="/predict")

_model = None


def load_model():
    global _model
    if _model is not None:
        return _model
    path = Config.MODEL_PATH
    if not path or not os.path.exists(path):
        return None
    try:
        import joblib
        _model = joblib.load(path)
    except Exception as e:
        print(f"[predict] Failed to load model: {e}")
        _model = None
    return _model


@bp.post("")
@require_auth
def predict():
    data = request.get_json(force=True) or {}
    features = data.get("features") or {}

    model = load_model()
    if model is None:
        # Fallback deterministic mock so the frontend keeps working.
        return jsonify({
            "prediction": "unknown",
            "confidence": 0.0,
            "model": "mock",
            "message": "Model not loaded on server. Set MODEL_PATH in .env.",
        }), 200

    # Adapt this to your model's expected input schema.
    try:
        import numpy as np
        x = np.array([list(features.values())], dtype=float)
        pred = model.predict(x)[0]
        proba = None
        if hasattr(model, "predict_proba"):
            proba = float(max(model.predict_proba(x)[0]))
        return jsonify({
            "prediction": str(pred),
            "confidence": proba,
            "model": "trained",
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {e}"}), 400
