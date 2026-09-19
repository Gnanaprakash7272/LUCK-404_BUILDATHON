from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
import logging

from backend.app.predictor import (
    predict_attack,
    MODEL_FEATURES,
    BASE_FEATURES,
    EXPECTED_CLASSES
)

from backend.app.response_engine import (
    process_response,
    get_response_status
)

from backend.app.prevention_engine import (
    prevention_status,
    get_source_status
)

from backend.app.database import (
    create_tables,
    get_db_status,
    save_predict_transaction,
    get_recent_events,
    get_stats,
    get_source_context,
    DatabaseUnavailableError,
)

from backend.app.auth import get_current_user
from backend.app.auth_routes import router as auth_router
from backend.app.anomaly_detector import (
    detect_anomaly,
    assess_novelty,
    get_anomaly_model
)
from backend.app.risk_engine import assess_risk
from backend.app.response_verifier import verify_response

logger = logging.getLogger("cyvora.api")

app = FastAPI(
    title="CYVORA API",
    description=(
        "CYVORA AI-Powered Cyber Attack Detection "
        "using V21.1 Global Ensemble + Web Specialist "
        "+ Confidence Aware Response Engine "
        "+ Prevention Enforcement "
        "+ PostgreSQL Persistence "
        "+ JWT Authentication"
    ),
    version="21.2.0"
)

# Include auth router (/auth/register, /auth/login, /auth/me)
app.include_router(auth_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STARTUP — create DB tables
# ============================================================

@app.on_event("startup")
def on_startup():
    try:
        create_tables()
    except Exception as exc:
        logger.error(
            "Database startup failed (API still running): %s", exc
        )


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class PredictionRequest(BaseModel):
    features: Dict[str, Any]
    source_id: str = "unknown"


class ResponseStatusRequest(BaseModel):
    source_id: str


# ============================================================
# ROOT — LIVE DASHBOARD
# ============================================================

@app.get("/")
def root():
    from fastapi.responses import HTMLResponse

    return HTMLResponse("""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CYVORA — AI Cyber Defense</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #070b12;
    color: #e8eef7;
}

header {
    height: 72px;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #1c2635;
    background: #0a0f18;
}

.logo {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 2px;
}

.logo span {
    color: #35d49a;
}

.status {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 14px;
}

.dot {
    width: 10px;
    height: 10px;
    background: #35d49a;
    border-radius: 50%;
    box-shadow: 0 0 12px #35d49a;
}

.container {
    max-width: 1400px;
    margin: auto;
    padding: 28px;
}

.hero {
    margin-bottom: 25px;
}

.hero h1 {
    margin: 0;
    font-size: 34px;
}

.hero p {
    color: #8d9aad;
    margin-top: 8px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.card {
    background: #0d131e;
    border: 1px solid #1c2737;
    border-radius: 14px;
    padding: 20px;
}

.card h3 {
    margin: 0 0 10px;
    color: #8d9aad;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.value {
    font-size: 25px;
    font-weight: 700;
}

.green {
    color: #35d49a;
}

.blue {
    color: #62a8ff;
}

.yellow {
    color: #f4c95d;
}

.red {
    color: #ff6262;
}

.section {
    margin-top: 22px;
}

.section h2 {
    font-size: 19px;
    margin-bottom: 14px;
}

.panel {
    background: #0d131e;
    border: 1px solid #1c2737;
    border-radius: 14px;
    padding: 22px;
}

button {
    border: 0;
    border-radius: 10px;
    padding: 13px 22px;
    background: #35d49a;
    color: #06100c;
    font-weight: 700;
    cursor: pointer;
}

button:hover {
    opacity: .85;
}

.result {
    margin-top: 18px;
    display: none;
}

.result-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.small {
    color: #8d9aad;
    font-size: 12px;
    margin-bottom: 5px;
}

.big {
    font-size: 21px;
    font-weight: 700;
}

pre {
    background: #070b12;
    padding: 15px;
    border-radius: 10px;
    overflow: auto;
    color: #b8c5d6;
}

@media(max-width: 900px) {
    .grid,
    .result-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media(max-width: 550px) {
    .grid,
    .result-grid {
        grid-template-columns: 1fr;
    }
}
</style>
</head>

<body>

<header>
    <div class="logo">CY<span>VORA</span></div>

    <div class="status">
        <div class="dot"></div>
        SYSTEM OPERATIONAL
    </div>
</header>

<div class="container">

    <div class="hero">
        <h1>AI Cyber Defense Dashboard</h1>
        <p>Real-time attack detection, response and prevention</p>
    </div>

    <div class="grid">

        <div class="card">
            <h3>Model</h3>
            <div class="value blue" id="model">Loading...</div>
        </div>

        <div class="card">
            <h3>Prediction Engine</h3>
            <div class="value green">ACTIVE</div>
        </div>

        <div class="card">
            <h3>Response Engine</h3>
            <div class="value green">ACTIVE</div>
        </div>

        <div class="card">
            <h3>Prevention Engine</h3>
            <div class="value green">ACTIVE</div>
        </div>

    </div>

    <div class="section">
        <h2>System Information</h2>

        <div class="panel">
            <div class="grid">

                <div>
                    <div class="small">API</div>
                    <div class="big green" id="api">Checking...</div>
                </div>

                <div>
                    <div class="small">Model Version</div>
                    <div class="big" id="model2">Checking...</div>
                </div>

                <div>
                    <div class="small">Classes</div>
                    <div class="big" id="classes">-</div>
                </div>

                <div>
                    <div class="small">Features</div>
                    <div class="big" id="features">-</div>
                </div>

            </div>
        </div>
    </div>

    <div class="section">
        <h2>Live Prediction Test</h2>

        <div class="panel">

            <p style="color:#8d9aad">
                Send a test traffic sample to the CYVORA V21.1 prediction engine.
            </p>

            <button onclick="runTest()">RUN PREDICTION</button>

            <div class="result" id="result">

                <div class="result-grid">

                    <div class="card">
                        <div class="small">Prediction</div>
                        <div class="big" id="prediction">-</div>
                    </div>

                    <div class="card">
                        <div class="small">Confidence</div>
                        <div class="big blue" id="confidence">-</div>
                    </div>

                    <div class="card">
                        <div class="small">Severity</div>
                        <div class="big" id="severity">-</div>
                    </div>

                    <div class="card">
                        <div class="small">Response</div>
                        <div class="big green" id="response">-</div>
                    </div>

                </div>

                <div style="margin-top:15px">
                    <div class="small">Prevention</div>
                    <div class="big" id="prevention">-</div>
                </div>

                <pre id="raw"></pre>

            </div>

        </div>
    </div>

</div>

<script>

async function loadSystem() {

    try {

        const health = await fetch("/health");
        const h = await health.json();

        document.getElementById("api").textContent =
            h.status === "healthy" ? "CONNECTED" : "ERROR";

        document.getElementById("model").textContent =
            h.model_version;

        document.getElementById("model2").textContent =
            h.model_version;

        const info = await fetch("/model-info");
        const i = await info.json();

        document.getElementById("classes").textContent =
            i.class_count + " classes";

        document.getElementById("features").textContent =
            i.final_feature_count + " features";

    } catch (e) {

        document.getElementById("api").textContent = "DISCONNECTED";

    }

}


async function runTest() {

    const payload = {
        features: {
            "Destination Port": 80,
            "Flow Duration": 1000000,
            "Total Fwd Packets": 10,
            "Total Backward Packets": 8,
            "Total Length of Fwd Packets": 500,
            "Total Length of Bwd Packets": 400,
            "Fwd Packet Length Max": 100,
            "Fwd Packet Length Min": 20,
            "Fwd Packet Length Mean": 50,
            "Fwd Packet Length Std": 10,
            "Bwd Packet Length Max": 100,
            "Bwd Packet Length Min": 20,
            "Bwd Packet Length Mean": 50,
            "Bwd Packet Length Std": 10,
            "Flow Bytes/s": 900,
            "Flow Packets/s": 18,
            "Flow IAT Mean": 1000,
            "Flow IAT Std": 100,
            "Flow IAT Max": 5000,
            "Flow IAT Min": 100,
            "Fwd IAT Total": 5000,
            "Fwd IAT Mean": 500,
            "Fwd IAT Std": 100,
            "Fwd IAT Max": 2000,
            "Fwd IAT Min": 100,
            "Bwd IAT Total": 4000,
            "Bwd IAT Mean": 500,
            "Bwd IAT Std": 100,
            "Bwd IAT Max": 2000,
            "Bwd IAT Min": 100,
            "Fwd PSH Flags": 1,
            "Fwd URG Flags": 0,
            "Fwd Header Length": 200,
            "Bwd Header Length": 160,
            "Fwd Packets/s": 10,
            "Bwd Packets/s": 8,
            "Min Packet Length": 20,
            "Max Packet Length": 100,
            "Packet Length Mean": 50,
            "Packet Length Std": 10,
            "Packet Length Variance": 100,
            "FIN Flag Count": 0,
            "SYN Flag Count": 1,
            "RST Flag Count": 0,
            "PSH Flag Count": 1,
            "ACK Flag Count": 1,
            "URG Flag Count": 0,
            "ECE Flag Count": 0,
            "Down/Up Ratio": 0.8,
            "Average Packet Size": 50,
            "Init_Win_bytes_forward": 8192,
            "Init_Win_bytes_backward": 8192,
            "act_data_pkt_fwd": 5,
            "min_seg_size_forward": 20
        },
        source_id: "BROWSER_TEST_001"
    };

    const resultBox = document.getElementById("result");
    resultBox.style.display = "block";

    document.getElementById("prediction").textContent = "Running...";
    document.getElementById("confidence").textContent = "...";

    try {

        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        const r = data.result;

        document.getElementById("prediction").textContent =
            r.prediction;

        document.getElementById("confidence").textContent =
            (r.confidence * 100).toFixed(2) + "%";

        document.getElementById("severity").textContent =
            r.severity;

        document.getElementById("response").textContent =
            data.response.response_action;

        document.getElementById("prevention").textContent =
            data.prevention.action +
            " — " +
            data.prevention.status;

        document.getElementById("raw").textContent =
            JSON.stringify(data, null, 2);

    } catch (e) {

        document.getElementById("prediction").textContent =
            "ERROR";

        document.getElementById("raw").textContent =
            e.toString();

    }

}

loadSystem();

</script>

</body>
</html>
""")


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CYVORA API",
        "model_version": "V21.1",
        "response_engine": "active",
        "prevention_engine": "active"
    }


# ============================================================
# MODEL INFO
# ============================================================

@app.get("/model-info")
def model_info():
    return {
        "model_version": "V21.1",
        "model_type": (
            "Global RF + ExtraTrees + "
            "Web Attack Specialist"
        ),
        "base_feature_count": len(BASE_FEATURES),
        "engineered_feature_count": (
            len(MODEL_FEATURES) - len(BASE_FEATURES)
        ),
        "final_feature_count": len(MODEL_FEATURES),
        "class_count": len(EXPECTED_CLASSES),
        "classes": EXPECTED_CLASSES,
        "model_loaded": True,

        "response_engine": {
            "status": "active",
            "block_threshold": 0.90,
            "rate_limit_threshold": 0.70,
            "block_duration_seconds": 300,
            "rate_limit_duration_seconds": 120
        },

        "prevention_engine": {
            "status": "active",
            "enforcement": "API_LEVEL",
            "supported_actions": [
                "ALLOW",
                "ALERT",
                "RATE_LIMIT",
                "BLOCK"
            ]
        },

        "anomaly_detector": {
            "detector": "isolation_forest",
            "model_version": "V1.0-CICIDS2017-BENIGN",
            "status": "active" if get_anomaly_model() is not None else "unavailable",
            "decision_threshold": 0.50,
            "high_anomaly_threshold": 0.60,
        },

        "risk_engine": {
            "status": "active",
            "model": "deterministic_context_risk_v1",
            "context_window_minutes": 10,
            "max_recent_events": 50,
            "weights": {
                "threat": 0.40,
                "anomaly": 0.35,
                "context": 0.25,
            },
        },

        "response_verifier": {
            "status": "active",
            "enforcement_layer": "APPLICATION_LEVEL",
            "supported_actions": ["ALLOW", "ALERT", "RATE_LIMIT", "BLOCK"],
        }
    }


# ============================================================
# PREDICT  (core endpoint)
# ============================================================

@app.post("/predict")
def predict(request: PredictionRequest, current_user=Depends(get_current_user)):

    try:

        # ----------------------------------------------------------
        # 1. Prevention pre-check
        # ----------------------------------------------------------
        source_status = get_source_status(
            request.source_id
        )

        if source_status == "BLOCKED":
            raise HTTPException(
                status_code=403,
                detail={
                    "success": False,
                    "action": "BLOCK",
                    "status": "ATTACK_BLOCKED",
                    "source_id": request.source_id,
                    "message": (
                        "Source is blocked by "
                        "CYVORA prevention engine"
                    )
                }
            )

        if source_status == "RATE_LIMITED":
            raise HTTPException(
                status_code=429,
                detail={
                    "success": False,
                    "action": "RATE_LIMIT",
                    "status": "TRAFFIC_RATE_LIMITED",
                    "source_id": request.source_id,
                    "message": (
                        "Source is temporarily "
                        "rate limited"
                    )
                }
            )

        # ----------------------------------------------------------
        # 2. ML Prediction
        # ----------------------------------------------------------
        prediction_result = predict_attack(
            request.features
        )

        # ----------------------------------------------------------
        # 2b. Unsupervised Anomaly / Novelty Detection
        # ----------------------------------------------------------
        anomaly_result = detect_anomaly(request.features)
        novelty_assessment = assess_novelty(prediction_result, anomaly_result)

        # Attach anomaly and novelty to prediction_result
        prediction_result["anomaly"] = anomaly_result
        prediction_result["novelty"] = novelty_assessment
        anomaly_result["novelty_label"] = novelty_assessment.get("novelty_label")

        # ----------------------------------------------------------
        # 2c. Context Analysis & Risk Assessment
        # ----------------------------------------------------------
        context_data = get_source_context(
            request.source_id,
            window_minutes=10,
            limit=50
        )
        risk_result = assess_risk(
            prediction_result=prediction_result,
            anomaly_result=anomaly_result,
            context_data=context_data,
        )

        # Attach risk assessment to prediction_result
        prediction_result["risk"] = risk_result

        # ----------------------------------------------------------
        # 3. Response Engine
        #    Returns dict with key "response_action" (not "action")
        # ----------------------------------------------------------
        response_result = process_response(
            prediction_result,
            source_id=request.source_id
        )

        # FIX: response_engine returns "response_action", not "action"
        action = str(
            response_result.get(
                "response_action",
                "ALLOW"
            )
        ).upper()

        # Deterministic UNKNOWN_ANOMALOUS response triage:
        # If anomaly is high and classifier was benign / low-confidence,
        # escalate action to ALERT (monitoring) without hard-blocking.
        if novelty_assessment.get("novelty_label") == "UNKNOWN_ANOMALOUS" and action == "ALLOW":
            action = "ALERT"
            response_result["response_action"] = "ALERT"
            response_result["response_status"] = "TRAFFIC_MONITORED"
            alert_severity = "HIGH" if risk_result.get("risk_level") in ["HIGH", "CRITICAL"] else "MEDIUM"
            response_result["severity"] = alert_severity
            prediction_result["severity"] = alert_severity
            response_result["reason"] = (
                f"Novel / unknown anomalous behavior detected (anomaly={anomaly_result.get('anomaly_score', 0.0):.3f}, "
                f"risk={risk_result.get('risk_score', 0.0):.3f}, level={alert_severity}). "
                "Classified as UNKNOWN_ANOMALOUS - escalated to ALERT for monitoring."
            )

        # ----------------------------------------------------------
        # 4. Hard enforcement gates (BLOCK / RATE_LIMIT)
        # ----------------------------------------------------------
        # ----------------------------------------------------------
        # 4. Response Verification & Application Enforcement
        # ----------------------------------------------------------
        prevention_result = response_result.get("prevention") or {
            "enforced": True,
            "action": action,
            "status": response_result.get("response_status", "ACTIVE"),
            "source_id": request.source_id,
        }

        verification_result = verify_response(
            action=action,
            source_id=request.source_id,
            prevention_result=prevention_result,
        )

        # ----------------------------------------------------------
        # 5. Persist to PostgreSQL (single transaction)
        #    Never crash the prediction response on DB failure.
        # ----------------------------------------------------------
        db_result = save_predict_transaction(
            source_id=request.source_id,
            raw_features=request.features,
            prediction_result=prediction_result,
            response_result=response_result,
            prevention_result=prevention_result,
            anomaly_result=anomaly_result,
            risk_result=risk_result,
            verification_result=verification_result,
        )

        if not db_result.get("persisted"):
            logger.warning(
                "Prediction for source_id=%s was NOT persisted to DB: %s",
                request.source_id,
                db_result.get("error"),
            )

        # ----------------------------------------------------------
        # 6. Return response with verified outcome
        # ----------------------------------------------------------
        return {
            "success": True,
            "result": prediction_result,
            "response": response_result,
            "prevention": prevention_result,
            "verification": verification_result,
            "anomaly": anomaly_result,
            "novelty": novelty_assessment,
            "risk": risk_result,
            "db_persisted": db_result.get("persisted", False),
            "security_event_id": db_result.get("security_event_id"),
            "db_error": (
                db_result.get("error")
                if not db_result.get("persisted")
                else None
            ),
        }

    except HTTPException:
        raise

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
# RESPONSE STATUS
# ============================================================

@app.post("/response/status")
def response_status(
    request: ResponseStatusRequest
):

    try:

        status = get_response_status(
            request.source_id
        )

        return {
            "success": True,
            "source_id": request.source_id,
            "status": status
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Response status check failed: "
                f"{str(e)}"
            )
        )


# ============================================================
# PREVENTION STATUS
# ============================================================

@app.get("/prevention/status")
def get_prevention_status():

    try:

        status = prevention_status()

        return {
            "success": True,
            "prevention": status
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Prevention status check failed: "
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
        "rare_attack_optimization": "active",
        "response_engine": "active",
        "confidence_aware_response": "active",
        "prevention_engine": "active",
        "prevention_type": "API_LEVEL",
        "enforcement": "enabled",
        "response_actions": [
            "ALLOW",
            "ALERT",
            "RATE_LIMIT",
            "BLOCK"
        ]
    }


# ============================================================
# DATABASE STATUS   (new)
# ============================================================

@app.get("/database/status")
def database_status(current_user=Depends(get_current_user)):
    """
    Live database connectivity probe.
    Returns 'available' only when PostgreSQL is actually reachable.
    Never fabricates a healthy status.
    """
    status = get_db_status()
    http_code = 200 if status.get("status") == "available" else 503
    return JSONResponse(content=status, status_code=http_code)


# ============================================================
# RECENT EVENTS   (new)
# ============================================================

@app.get("/events/recent")
def recent_events(limit: int = 50, current_user=Depends(get_current_user)):
    """
    Return the most recent security events with prediction outcomes.
    Returns HTTP 503 with a clear error if the database is unavailable.
    """
    try:
        events = get_recent_events(limit=limit)
        return {
            "success": True,
            "count": len(events),
            "events": events
        }
    except DatabaseUnavailableError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "database_unavailable",
                "detail": str(exc),
                "events": None,
            }
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Events query failed: {str(exc)}"
        )


# ============================================================
# STATS   (new)
# ============================================================

@app.get("/stats")
def stats(current_user=Depends(get_current_user)):
    """
    Return aggregate prediction statistics from PostgreSQL.
    Returns HTTP 503 with a clear error if the database is unavailable.
    """
    try:
        data = get_stats()
        return {
            "success": True,
            "stats": data
        }
    except DatabaseUnavailableError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "database_unavailable",
                "detail": str(exc),
                "stats": None,
            }
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Stats query failed: {str(exc)}"
        )
