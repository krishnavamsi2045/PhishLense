import joblib
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = BASE_DIR / "data" / "models" / "phishing_model.pkl"
COLUMNS_PATH = BASE_DIR / "data" / "models" / "feature_columns.pkl"

model = joblib.load(MODEL_PATH)
columns = joblib.load(COLUMNS_PATH)


def predict(features):
    df = pd.DataFrame([features])

    if "suspicious_keywords" in df.columns:
        df = df.drop(columns=["suspicious_keywords"])

    df = df[columns]

    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0]

    phishing_score = probability[1] * 100

    return {
        "prediction": (
            "Phishing"
            if prediction == 1
            else "Legitimate"
        ),
        "confidence": float(phishing_score)
    }