from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware

from backend.app.predictor import (
    predict_attack,
    MODEL_FEATURES
)


# ============================================================
# CYVORA API
# RARE ATTACK OPTIMIZATION V4
# ============================================================

app = FastAPI(
    title="CYVORA API",
    description=(
        "CYVORA Rare Attack Detection System "
        "using Rare Attack Optimization V4"
    ),
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REQUEST MODEL
# ============================================================

class PredictionRequest(BaseModel):

    features: Dict[str, Any]


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "project": "CYVORA",
        "status": "online",
        "model": "Rare Attack Optimization V4",
        "message": "CYVORA backend is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "CYVORA API"
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    feature_count = (
        len(MODEL_FEATURES)
        if MODEL_FEATURES is not None
        else None
    )

    return {
        "model_version": "V4",
        "model_type": "Rare Attack Optimized Random Forest",
        "feature_count": feature_count,
        "model_loaded": True
    }


# ============================================================
# PREDICTION API
# ============================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    try:

        result = predict_attack(
            request.features
        )

        return {
            "success": True,
            "result": result
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# ============================================================
# API STATUS
# ============================================================

@app.get("/api/status")
def api_status():

    return {
        "api": "CYVORA",
        "status": "operational",
        "backend": "FastAPI",
        "model": "V4",
        "prediction_engine": "active"
    }
