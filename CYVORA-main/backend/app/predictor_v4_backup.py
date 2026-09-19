import os
import joblib
import pandas as pd
import numpy as np


# ============================================================
# CYVORA V4 MODEL CONFIGURATION
# ============================================================

MODEL_PATH = (
    r"C:\CYVORA\models\rare_attack_optimization_v4"
    r"\cyvora_rare_attack_optimized_rf_v4.pkl"
)

ENCODER_PATH = (
    r"C:\CYVORA\models\rare_attack_optimization_v4"
    r"\v4_label_encoder.pkl"
)


# ============================================================
# LOAD MODEL
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"V4 model not found: {MODEL_PATH}"
    )

if not os.path.exists(ENCODER_PATH):
    raise FileNotFoundError(
        f"V4 label encoder not found: {ENCODER_PATH}"
    )


model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)


# ============================================================
# MODEL INFORMATION
# ============================================================

if hasattr(model, "feature_names_in_"):
    MODEL_FEATURES = list(model.feature_names_in_)
else:
    MODEL_FEATURES = None


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_attack(features: dict):

    # --------------------------------------------------------
    # Convert input to DataFrame
    # --------------------------------------------------------

    input_df = pd.DataFrame([features])

    # --------------------------------------------------------
    # Feature validation
    # --------------------------------------------------------

    if MODEL_FEATURES is not None:

        missing_features = [
            feature
            for feature in MODEL_FEATURES
            if feature not in input_df.columns
        ]

        extra_features = [
            feature
            for feature in input_df.columns
            if feature not in MODEL_FEATURES
        ]

        if missing_features:
            raise ValueError(
                f"Missing features: {missing_features}"
            )

        # Keep exactly the same feature order used during training
        input_df = input_df[MODEL_FEATURES]

    # --------------------------------------------------------
    # Data quality check
    # --------------------------------------------------------

    if input_df.isna().any().any():
        raise ValueError(
            "Input contains missing values."
        )

    numeric_values = input_df.select_dtypes(
        include=[np.number]
    )

    if np.isinf(
        numeric_values.to_numpy()
    ).any():

        raise ValueError(
            "Input contains infinity values."
        )

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction_encoded = model.predict(input_df)

    prediction_id = int(
        prediction_encoded[0]
    )

    prediction_label = label_encoder.inverse_transform(
        [prediction_id]
    )[0]

    # --------------------------------------------------------
    # Confidence
    # --------------------------------------------------------

    confidence = None

    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(
            input_df
        )

        confidence = float(
            np.max(probabilities[0])
        )

    # --------------------------------------------------------
    # Attack classification
    # --------------------------------------------------------

    benign_labels = {
        "BENIGN",
        "Benign",
        "benign"
    }

    is_attack = (
        str(prediction_label)
        not in benign_labels
    )

    # --------------------------------------------------------
    # Severity
    # --------------------------------------------------------

    if not is_attack:

        severity = "LOW"

    elif confidence is not None:

        if confidence >= 0.90:
            severity = "HIGH"

        elif confidence >= 0.70:
            severity = "MEDIUM"

        else:
            severity = "LOW"

    else:

        severity = "MEDIUM"

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "prediction": str(prediction_label),
        "prediction_id": prediction_id,
        "confidence": confidence,
        "is_attack": is_attack,
        "severity": severity,
        "model_version": "V4"
    }