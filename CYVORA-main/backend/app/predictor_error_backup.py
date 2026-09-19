@'
import os
import joblib
import pandas as pd
import numpy as np


# ============================================================
# CYVORA V21.1 PREDICTOR
# ============================================================

MODEL_PATH = (
    r"C:\CYVORA\models\rare_attack_optimization_v21_1"
    r"\cyvora_rare_attack_model_v21_1.pkl"
)


# ============================================================
# LOAD V21.1 MODEL BUNDLE
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"V21.1 model not found: {MODEL_PATH}"
    )

bundle = joblib.load(MODEL_PATH)


# ============================================================
# MODEL COMPONENTS
# ============================================================

global_rf = bundle["global_rf"]
global_extra_trees = bundle["global_extra_trees"]

web_rf = bundle["web_rf"]
web_extra_trees = bundle["web_extra_trees"]

imputer = bundle["imputer"]

MODEL_FEATURES = list(bundle["features"])
BASE_FEATURES = list(bundle["base_features"])

EXPECTED_CLASSES = list(bundle["expected_classes"])

label_to_id = bundle["label_to_id"]
id_to_label = bundle["id_to_label"]

BEST_THRESHOLD = float(
    bundle["best_threshold"]
)

BEST_MARGIN = float(
    bundle["best_margin"]
)

BEST_GLOBAL_CONFIDENCE = float(
    bundle["best_global_confidence"]
)

WEB_CLASSES = list(
    bundle["web_classes"]
)

WEB_IDS = [
    label_to_id[x]
    for x in WEB_CLASSES
]


# ============================================================
# BASIC VALIDATION
# ============================================================

if len(MODEL_FEATURES) != 83:
    raise RuntimeError(
        f"Expected 83 V21.1 features, "
        f"found {len(MODEL_FEATURES)}"
    )


# ============================================================
# SAFE DIVISION
# ============================================================

def safe_div(a, b):

    return np.divide(
        a,
        b,
        out=np.zeros_like(
            a,
            dtype=np.float32
        ),
        where=np.abs(b) > 1e-12
    )


# ============================================================
# V21.1 FEATURE ENGINEERING
# EXACT TRAINING LOGIC
# ============================================================

def add_engineered_features(df):

    df = df.copy()

    def col(name):

        return pd.to_numeric(
            df[name],
            errors="coerce"
        ).fillna(0).values.astype(
            np.float32
        )

    fwd_packets = col(
        "Total Fwd Packets"
    )

    bwd_packets = col(
        "Total Backward Packets"
    )

    fwd_length = col(
        "Total Length of Fwd Packets"
    )

    bwd_length = col(
        "Total Length of Bwd Packets"
    )

    fwd_iat_total = col(
        "Fwd IAT Total"
    )

    flow_iat_mean = col(
        "Flow IAT Mean"
    )

    flow_iat_std = col(
        "Flow IAT Std"
    )

    flow_iat_max = col(
        "Flow IAT Max"
    )

    flow_iat_min = col(
        "Flow IAT Min"
    )

    flow_duration = col(
        "Flow Duration"
    )

    fwd_iat_min = col(
        "Fwd IAT Min"
    )

    fwd_iat_max = col(
        "Fwd IAT Max"
    )

    init_fwd = col(
        "Init_Win_bytes_forward"
    )

    init_bwd = col(
        "Init_Win_bytes_backward"
    )

    fwd_header = col(
        "Fwd Header Length"
    )

    bwd_header = col(
        "Bwd Header Length"
    )

    psh = col(
        "PSH Flag Count"
    )

    flow_packets = col(
        "Flow Packets/s"
    )

    # --------------------------------------------------------
    # Engineered features
    # --------------------------------------------------------

    df["Fwd_IAT_Range"] = (
        fwd_iat_max - fwd_iat_min
    )

    df["Flow_IAT_Range"] = (
        flow_iat_max - flow_iat_min
    )

    df["Fwd_Bwd_Packet_Ratio"] = safe_div(
        fwd_packets,
        bwd_packets
    )

    df["Window_Size_Ratio"] = safe_div(
        init_fwd,
        init_bwd
    )

    df["Window_Size_Log_Ratio"] = np.log1p(
        np.abs(
            df["Window_Size_Ratio"]
        )
    )

    df["Packet_Direction_Imbalance"] = safe_div(
        np.abs(
            fwd_packets - bwd_packets
        ),
        fwd_packets + bwd_packets
    )

    df["Forward_Packet_Fraction"] = safe_div(
        fwd_packets,
        fwd_packets + bwd_packets
    )

    df["Backward_Byte_Fraction"] = safe_div(
        bwd_length,
        fwd_length + bwd_length
    )

    df["Header_Length_Ratio"] = safe_div(
        fwd_header,
        bwd_header
    )

    df["IAT_Asymmetry"] = safe_div(
        fwd_iat_total,
        flow_duration
    )

    df["PSH_Per_Fwd_Packet"] = safe_div(
        psh,
        fwd_packets
    )

    df["Log_Flow_Duration"] = np.log1p(
        np.abs(flow_duration)
    )

    df["Log_Flow_Packets_s"] = np.log1p(
        np.abs(flow_packets)
    )

    df["Web_Flow_Intensity"] = safe_div(
        fwd_length + bwd_length,
        flow_duration + 1
    )

    df["Fwd_Length_Ratio"] = safe_div(
        fwd_length,
        fwd_packets
    )

    df["Bwd_Length_Ratio"] = safe_div(
        bwd_length,
        bwd_packets
    )

    df["Packet_Length_Ratio"] = safe_div(
        fwd_length,
        bwd_length
    )

    df["IAT_Mean_Ratio"] = safe_div(
        flow_iat_mean,
        flow_duration
    )

    df["Fwd_Bwd_Length_Ratio"] = safe_div(
        fwd_length,
        bwd_length
    )

    df["Flow_Packet_Density"] = safe_div(
        fwd_packets + bwd_packets,
        flow_duration + 1
    )

    df["Window_Interaction"] = (
        np.log1p(
            np.abs(init_fwd)
        )
        *
        np.log1p(
            np.abs(init_bwd)
        )
    )

    fin = col("FIN Flag Count")
    syn = col("SYN Flag Count")
    rst = col("RST Flag Count")
    ack = col("ACK Flag Count")
    urg = col("URG Flag Count")

    df["TCP_Flag_Density"] = safe_div(
        fin + syn + rst + ack + urg,
        fwd_packets + bwd_packets
    )

    df["Fwd_Header_Per_Packet"] = safe_div(
        fwd_header,
        fwd_packets
    )

    df["Bwd_Header_Per_Packet"] = safe_div(
        bwd_header,
        bwd_packets
    )

    df["Length_Per_Fwd_Packet"] = safe_div(
        fwd_length,
        fwd_packets
    )

    df["Length_Per_Bwd_Packet"] = safe_div(
        bwd_length,
        bwd_packets
    )

    df["IAT_Variability"] = safe_div(
        flow_iat_std,
        flow_iat_mean
    )

    packet_mean = col(
        "Packet Length Mean"
    )

    fwd_mean = col(
        "Fwd Packet Length Mean"
    )

    bwd_mean = col(
        "Bwd Packet Length Mean"
    )

    df["Packet_Size_Imbalance"] = safe_div(
        np.abs(
            fwd_mean - bwd_mean
        ),
        packet_mean + 1
    )

    df["Flow_Asymmetry"] = safe_div(
        fwd_packets - bwd_packets,
        fwd_packets + bwd_packets
    )

    return df


# ============================================================
# PREDICTION
# ============================================================

def predict_attack(features: dict):

    # --------------------------------------------------------
    # Convert request to DataFrame
    # --------------------------------------------------------

    input_df = pd.DataFrame([features])

    # --------------------------------------------------------
    # Validate 54 BASE FEATURES
    # --------------------------------------------------------

    missing_features = [
        feature
        for feature in BASE_FEATURES
        if feature not in input_df.columns
    ]

    if missing_features:

        raise ValueError(
            "Missing base features: "
            f"{missing_features}"
        )

    # --------------------------------------------------------
    # Feature Engineering
    # --------------------------------------------------------

    input_df = add_engineered_features(
        input_df
    )

    # --------------------------------------------------------
    # Select EXACT 83 training features
    # --------------------------------------------------------

    missing_final = [
        feature
        for feature in MODEL_FEATURES
        if feature not in input_df.columns
    ]

    if missing_final:

        raise ValueError(
            "Missing V21.1 engineered features: "
            f"{missing_final}"
        )

    input_df = input_df[
        MODEL_FEATURES
    ].copy()

    # --------------------------------------------------------
    # Numeric conversion
    # --------------------------------------------------------

    for feature in MODEL_FEATURES:

        input_df[feature] = pd.to_numeric(
            input_df[feature],
            errors="coerce"
        )

    input_df = input_df.astype(
        np.float32
    )

    # --------------------------------------------------------
    # Saved training imputer
    # --------------------------------------------------------

    X = imputer.transform(
        input_df
    ).astype(
        np.float32
    )

    X = np.nan_to_num(
        X,
        nan=0.0,
        posinf=0.0,
        neginf=0.0
    )

    # ========================================================
    # GLOBAL ENSEMBLE
    # ========================================================

    rf_prob = global_rf.predict_proba(X)

    et_prob = global_extra_trees.predict_proba(X)

    global_prob = (
        0.5 * rf_prob
        +
        0.5 * et_prob
    )

    global_index = int(
        np.argmax(
            global_prob[0]
        )
    )

    global_classes = list(
        global_rf.classes_
    )

    global_prediction_id = int(
        global_classes[global_index]
    )

    global_confidence = float(
        np.max(
            global_prob[0]
        )
    )

    # ========================================================
    # WEB SPECIALIST
    # ========================================================

    web_rf_prob = web_rf.predict_proba(
        X
    )

    web_et_prob = web_extra_trees.predict_proba(
        X
    )

    web_prob = (
        0.5 * web_rf_prob
        +
        0.5 * web_et_prob
    )

    web_index = int(
        np.argmax(
            web_prob[0]
        )
    )

    web_classes_local = list(
        web_rf.classes_
    )

    web_local_id = int(
        web_classes_local[web_index]
    )

    web_global_id = WEB_IDS[
        web_local_id
    ]

    web_confidence = float(
        np.max(
            web_prob[0]
        )
    )

    sorted_web = np.sort(
        web_prob[0]
    )

    web_margin = float(
        sorted_web[-1]
        -
        sorted_web[-2]
    )

    # ========================================================
    # CONFIDENCE-GATED OVERRIDE
    # EXACT V21.1 LOGIC
    # ========================================================

    global_is_web = (
        global_prediction_id
        in WEB_IDS
    )

    global_uncertain = (
        global_confidence
        <
        BEST_GLOBAL_CONFIDENCE
    )

    specialist_condition = (
        web_confidence
        >=
        BEST_THRESHOLD
        and
        web_margin
        >=
        BEST_MARGIN
    )

    replace_prediction = (
        specialist_condition
        and
        (
            global_is_web
            or
            global_uncertain
        )
    )

    # --------------------------------------------------------
    # Final prediction
    # --------------------------------------------------------

    if replace_prediction:

        prediction_id = int(
            web_global_id
        )

        confidence = (
            web_confidence
        )

        decision_source = (
            "WEB_SPECIALIST"
        )

    else:

        prediction_id = (
            global_prediction_id
        )

        confidence = (
            global_confidence
        )

        decision_source = (
            "GLOBAL_ENSEMBLE"
        )

    prediction_label = str(
        id_to_label[
            prediction_id
        ]
    )

    # ========================================================
    # ATTACK CLASSIFICATION
    # ========================================================

    is_attack = (
        prediction_label != "BENIGN"
    )

    # ========================================================
    # SEVERITY
    # ========================================================

    if not is_attack:

        severity = "LOW"

    elif confidence >= 0.90:

        severity = "HIGH"

    elif confidence >= 0.70:

        severity = "MEDIUM"

    else:

        severity = "LOW"

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "prediction": prediction_label,

        "prediction_id": prediction_id,

        "confidence": round(
            confidence,
            6
        ),

        "is_attack": is_attack,

        "severity": severity,

        "model_version": "V21.1",

        "decision_source": decision_source,

        "global_prediction": str(
            id_to_label[
                global_prediction_id
            ]
        ),

        "global_confidence": round(
            global_confidence,
            6
        ),

        "web_specialist_prediction": str(
            id_to_label[
                web_global_id
            ]
        ),

        "web_specialist_confidence": round(
            web_confidence,
            6
        ),

        "web_specialist_margin": round(
            web_margin,
            6
        ),

        "threshold": BEST_THRESHOLD,

        "margin_threshold": BEST_MARGIN,

        "global_confidence_threshold":
            BEST_GLOBAL_CONFIDENCE
    }
'@ | Set-Content C:\CYVORA\backend\app\predictor.py -Encoding UTF8