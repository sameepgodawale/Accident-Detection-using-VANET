import joblib
import numpy as np
import os

from ml_service.feature_schema import FEATURE_ORDER, SEVERITY_MAP

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

class AccidentModel:

    def __init__(self):
        self.model = joblib.load(MODEL_PATH)

    def predict(self, features):

        X = np.array([[features[f] for f in FEATURE_ORDER]])

        probs = self.model.predict_proba(X)[0]
        cls = probs.argmax()

        return {
            "severity": SEVERITY_MAP[cls],
            "confidence": float(probs[cls])
        }
