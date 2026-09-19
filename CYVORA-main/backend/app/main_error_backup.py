@'
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware

from backend.app.predictor import (
    predict_attack,
    MODEL_FEATURES,
    BASE_FEATURES,
    EXPECTED_CLASSES
)


# ============================================================
# CYVORA V21.1 API
# ============================================================

app = FastAPI(
    title="CYVORA API",
    description=(
        "CYVORA AI-Powered Cyber Attack Detection "
        "using V21.1 Global Ensemble + Web Specialist"
    ),
    version="21.1.0"
)


# ============================================================
# CORS
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
        "model": "V21.1",
        "message": (
            "CYVORA V21.1 backend is running"
        )
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "CYVORA API",
        "model_version": "V21.1"
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    return {
        "model_version": "V21.1",
        "model_type": (
            "Global RF + ExtraTrees "
            "+ Web Attack Specialist"
        ),
        "base_feature_count": len(
            BASE_FEATURES
        ),
        "engineered_feature_count": (
            len(MODEL_FEATURES)
            -
            len(BASE_FEATURES)
        ),
        "final_feature_count": len(
            MODEL_FEATURES
        ),
        "class_count": len(
            EXPECTED_CLASSES
        ),
        "classes": EXPECTED_CLASSES,
        "model_loaded": True
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
def predict(
    request: PredictionRequest
):

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
            detail=(
                "Prediction failed: "
                f"{str(e)}"
            )
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
        "model": "V21.1",
        "prediction_engine": "active",
        "web_specialist": "active",
        "rare_attack_optimization": "active"
    }
'@ | Set-Content C:\CYVORA\backend\app\main.py -Encoding UTF8