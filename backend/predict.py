import os
from flask import Blueprint, jsonify, request

from auth import require_auth
from config import Config

bp = Blueprint("predict", __name__, url_prefix="/predict")

_bundle = None

FEATURE_COLUMNS = [
    "Years_Since_2021",
    "Sex_Male",
    "Geographic_Region_Mindanao",
    "Geographic_Region_Visayas",
    "Disease_Category_Neurology",
    "Disease_Category_Others",
    "Disease_Category_Pediatrics",
    "Facility_Type_Public",
    "Mindanao_x_Neurology",
    "Mindanao_x_Others",
    "Mindanao_x_Pediatrics",
    "Visayas_x_Neurology",
    "Visayas_x_Others",
    "Visayas_x_Pediatrics",
]


def _default_model_path():
    here = os.path.dirname(os.path.abspath(__file__))
    candidate = os.path.join(here, "my_trained_model.pkl")
    return candidate if os.path.exists(candidate) else ""


def load_bundle():
    global _bundle
    if _bundle is not None:
        return _bundle
    path = Config.MODEL_PATH or _default_model_path()
    if not path or not os.path.exists(path):
        print(f"[predict] Model file not found at: {path!r}")
        return None
    try:
        import joblib
        _bundle = joblib.load(path)
        print(f"[predict] Model loaded from {path} ({_bundle.get('best_model_name')})")
    except Exception as e:
        print(f"[predict] Failed to load model: {e}")
        _bundle = None
    return _bundle


def encode_features(payload: dict) -> list:
    year = int(payload.get("Year") or 2021)
    sex = str(payload.get("Sex") or "").strip().lower()
    region = str(payload.get("Geographic_Region") or "").strip().lower()
    disease = str(payload.get("Disease_Category") or "").strip().lower()
    facility = str(payload.get("Facility_Type") or "").strip().lower()

    years_since = year - 2021
    sex_male = 1 if sex == "male" else 0
    r_mindanao = 1 if region == "mindanao" else 0
    r_visayas = 1 if region == "visayas" else 0
    d_neuro = 1 if disease == "neurology" else 0
    d_others = 1 if disease == "others" else 0
    d_peds = 1 if disease == "pediatrics" else 0
    f_public = 1 if facility == "public" else 0

    return [
        years_since,
        sex_male,
        r_mindanao,
        r_visayas,
        d_neuro,
        d_others,
        d_peds,
        f_public,
        r_mindanao * d_neuro,
        r_mindanao * d_others,
        r_mindanao * d_peds,
        r_visayas * d_neuro,
        r_visayas * d_others,
        r_visayas * d_peds,
    ]


@bp.post("")
@require_auth
def predict():
    payload = request.get_json(force=True) or {}
    # accept either flat payload or { features: {...} }
    features = payload.get("features") if isinstance(payload.get("features"), dict) else payload

    bundle = load_bundle()
    if bundle is None:
        return jsonify({
            "prediction": "Targeted Testing",
            "confidence": 0.0,
            "probability_comprehensive": 0.0,
            "probability_targeted": 0.0,
            "model": "unavailable",
            "message": "Model not loaded on server.",
        }), 200

    try:
        import numpy as np
        model = bundle["best_model"]
        scaler = bundle.get("scaler")

        x = np.array([encode_features(features)], dtype=float)
        if scaler is not None:
            x = scaler.transform(x)

        proba = model.predict_proba(x)[0]
        classes = list(model.classes_)
        # classes: 0 = Targeted, 1 = Comprehensive
        p_comp = float(proba[classes.index(1)]) if 1 in classes else 0.0
        p_tgt = float(proba[classes.index(0)]) if 0 in classes else 0.0

        label = "Comprehensive Profiling" if p_comp >= p_tgt else "Targeted Testing"
        confidence = max(p_comp, p_tgt)

        return jsonify({
            "prediction": label,
            "confidence": confidence,
            "probability_comprehensive": p_comp,
            "probability_targeted": p_tgt,
            "model": bundle.get("best_model_name", "trained"),
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {e}"}), 400
