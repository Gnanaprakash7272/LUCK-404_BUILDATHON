import os
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder


# ============================================================
# CYVORA V5 — WEB ATTACK SPECIALIST
# XSS vs BRUTE FORCE
# ============================================================

TRAIN_PATH = (
    r"C:\CYVORA\data\processed"
    r"\features\cyvora_train_engineered.csv"
)

VAL_PATH = (
    r"C:\CYVORA\data\processed"
    r"\features\cyvora_validation_engineered.csv"
)

OUTPUT_DIR = (
    r"C:\CYVORA\models"
    r"\web_attack_specialist_v5"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "Fwd_Bwd_Packet_Ratio",
    "Down/Up Ratio",
    "Flow IAT Min",
    "Fwd_Header_Payload_Ratio",
    "Bwd Packets/s_log",
    "URG Flag Count",
    "Init_Win_bytes_backward",
    "Fwd IAT Min",
    "Window_Size_Ratio",
    "Bwd IAT Mean",
    "Bwd IAT Std",
    "Packet_Length_CV",
    "Fwd_Packet_Length_Range",
    "Bwd Packets/s",
    "Flow Packets/s_log",
]


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("CYVORA V5 WEB ATTACK SPECIALIST")
print("=" * 70)

print("\nLoading training data...")

train = pd.read_csv(TRAIN_PATH)

print("Training rows:", len(train))


print("\nLoading validation data...")

val = pd.read_csv(VAL_PATH)

print("Validation rows:", len(val))


# ============================================================
# SELECT WEB ATTACKS
# ============================================================

def select_web_attacks(df):

    labels = df["Label"].astype(str)

    mask = (
        labels.str.contains(
            "XSS|Brute Force",
            case=False,
            na=False
        )
    )

    result = df.loc[mask].copy()

    # Normalize labels
    result["Target"] = np.where(
        result["Label"].astype(str)
        .str.contains(
            "XSS",
            case=False,
            na=False
        ),
        "XSS",
        "BRUTE_FORCE"
    )

    return result


train_web = select_web_attacks(train)
val_web = select_web_attacks(val)


print("\nWeb attack training distribution:")
print(train_web["Target"].value_counts())

print("\nWeb attack validation distribution:")
print(val_web["Target"].value_counts())


# ============================================================
# FEATURE VALIDATION
# ============================================================

missing = [
    f
    for f in FEATURES
    if f not in train_web.columns
]

if missing:

    raise ValueError(
        f"Missing features: {missing}"
    )


# ============================================================
# PREPARE DATA
# ============================================================

X_train = (
    train_web[FEATURES]
    .replace([np.inf, -np.inf], np.nan)
    .fillna(0)
)

X_val = (
    val_web[FEATURES]
    .replace([np.inf, -np.inf], np.nan)
    .fillna(0)
)

y_train = train_web["Target"]
y_val = val_web["Target"]


# ============================================================
# LABEL ENCODER
# ============================================================

encoder = LabelEncoder()

y_train_encoded = encoder.fit_transform(
    y_train
)

y_val_encoded = encoder.transform(
    y_val
)


print("\nClasses:")
print(
    list(encoder.classes_)
)


# ============================================================
# TRAIN MODEL
# ============================================================

print("\nTraining V5 specialist...")

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=20,
    min_samples_leaf=2,
    max_features="sqrt",
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

model.fit(
    X_train,
    y_train_encoded
)


# ============================================================
# VALIDATION
# ============================================================

pred = model.predict(
    X_val
)

print("\n" + "=" * 70)
print("V5 VALIDATION RESULTS")
print("=" * 70)

print(
    classification_report(
        y_val_encoded,
        pred,
        target_names=encoder.classes_,
        digits=4
    )
)


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_val_encoded,
        pred
    )
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

importance = pd.DataFrame({
    "Feature": FEATURES,
    "Importance": model.feature_importances_
})

importance = importance.sort_values(
    "Importance",
    ascending=False
)

print("\nTop specialist features:")

print(
    importance.to_string(
        index=False
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

MODEL_PATH = os.path.join(
    OUTPUT_DIR,
    "cyvora_web_specialist_v5.pkl"
)

ENCODER_PATH = os.path.join(
    OUTPUT_DIR,
    "v5_web_label_encoder.pkl"
)

FEATURE_PATH = os.path.join(
    OUTPUT_DIR,
    "v5_features.txt"
)


joblib.dump(
    model,
    MODEL_PATH
)

joblib.dump(
    encoder,
    ENCODER_PATH
)

with open(
    FEATURE_PATH,
    "w"
) as f:

    for feature in FEATURES:

        f.write(
            feature + "\n"
        )


print("\n" + "=" * 70)

print("V5 MODEL SAVED")
print("=" * 70)

print(
    "Model   :", MODEL_PATH
)

print(
    "Encoder :", ENCODER_PATH
)

print(
    "Features:", FEATURE_PATH
)

print("=" * 70)