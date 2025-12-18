from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Heart Disease Prediction API", version="1.0.0")

# Allowed origins for CORS
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://*.vercel.app",
    os.getenv("FRONTEND_URL", "")
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later you can restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
model = None
try:
    possible_paths = [
        "xgb_heart_model.pkl",
        "./xgb_heart_model.pkl",
        "backend/xgb_heart_model.pkl",
        os.path.join(os.path.dirname(__file__), "xgb_heart_model.pkl")
    ]

    for path in possible_paths:
        if os.path.exists(path):
            with open(path, "rb") as f:
                model = pickle.load(f)
            print(f"Model loaded successfully from: {path}")
            break
    else:
        print("Model file not found!")

except Exception as e:
    print(f"Error loading model: {e}")


class PatientData(BaseModel):
    age: str
    sex: str
    cp: str
    trestbps: str
    chol: str
    fbs: str
    restecg: str
    thalch: str
    exang: str
    oldpeak: str
    slope: str
    ca: str
    thal: str


class PredictionResponse(BaseModel):
    risk_probability: float
    risk_level: str
    recommendation: str
    confidence: float


def preprocess_input(data: PatientData) -> np.ndarray:
    """Convert frontend inputs to model-ready numpy array"""
    try:
        features = [
            float(data.age),
            float(data.sex),
            float(data.cp),
            float(data.trestbps),
            float(data.chol),
            float(data.fbs),
            float(data.restecg),
            float(data.thalch),
            float(data.exang),
            float(data.oldpeak),
            float(data.slope),
            float(data.ca),
            float(data.thal)
        ]
        return np.array([features])
    except Exception as e:
        raise ValueError(f"Error preprocessing input: {str(e)}")


@app.get("/")
async def root():
    return {"message": "Heart Disease Prediction API is running!", "model_loaded": model is not None}


@app.post("/test")
async def test(patient: PatientData):
    return {"message": "Test OK", "received": patient.dict()}


@app.post("/predict", response_model=PredictionResponse)
async def predict(patient: PatientData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        features = preprocess_input(patient)
        probability = model.predict_proba(features)[0][1]
        prediction = model.predict(features)[0]

        if probability < 0.3:
            risk = "Low Risk"
            rec = "Maintain healthy habits and regular checkups."
        elif probability < 0.7:
            risk = "Moderate Risk"
            rec = "Consult a cardiologist and monitor lifestyle."
        else:
            risk = "High Risk"
            rec = "Immediate medical attention recommended."

        return PredictionResponse(
            risk_probability=round(probability * 100, 2),
            risk_level=risk,
            recommendation=rec,
            confidence=round(max(probability, 1 - probability) * 100, 2)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

