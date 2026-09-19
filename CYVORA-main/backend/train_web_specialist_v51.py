import os
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder


# ============================================================
# CYVORA V5.1 — WEB ATTACK SPECIALIST
# TOP-5 FEATURE ABLATION EXPERIMENT
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
    r"\web_attack_specialist_v51"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ============================================================
# TOP-5 FEATURES FROM V5
# ============================================================

FEATURES = [
    "Flow Packets/s_log",
    "Bwd Packets/s_log",
    "Bwd Packets/s",
    "Fwd IAT Min",
    "Flow IAT Min",
]


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("CYVORA V5.1 WEB ATTACK SPECIALIST")
print("=" * 70)

print("\nLoading training data...")

train = pd.read_csv(TRAIN_PATH)

print("Training rows:", len(train))


print("\nLoading validation data...")

val = pd.read_csv(VAL_PATH)

print("Validation rows:", len(val))


# ============================================================
# SELECT XSS + BRUTE FORCE
# ============================================================

def select_web_attacks(df):

    labels = df["Label"].astype(str)

    mask = labels.str.contains(
        "XSS|Brute Force",
        case=False,
        na=False
    )

    result = df.loc[mask].copy()

    result["Target"] = np.where(
        result["Label"]
        .astype(str)
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


print("\nTraining distribution:")
print(train_web["Target"].value_counts())

print("\nValidation distribution:")
print(val_web["Target"].value_counts())


# ============================================================
# FEATURE VALIDATION
# ============================================================

missing_train = [
    f for f in FEATURES
    if f not in train_web.columns
]

missing_val = [
    f for f in FEATURES
    if f not in val_web.columns
]

if missing_train:
    raise ValueError(
        f"Missing training features: {missing_train}"
    )

if missing_val:
    raise ValueError(
        f"Missing validation features: {missing_val}"
    )


# ============================================================
# PREPARE FEATURES
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
# LABEL ENCODING
# ============================================================

encoder = LabelEncoder()

y_train_encoded = encoder.fit_transform(y_train)
y_val_encoded = encoder.transform(y_val)

print("\nClasses:")
print(list(encoder.classes_))


# ============================================================
# TRAIN
# ============================================================

print("\nTraining V5.1 specialist...")

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

pred = model.predict(X_val)


print("\n" + "=" * 70)
print("V5.1 VALIDATION RESULTS")
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

print("\nFeature Importance:")
print(
    importance.to_string(index=False)
)


# ============================================================
# SAVE MODEL
# ============================================================

MODEL_PATH = os.path.join(
    OUTPUT_DIR,
    "cyvora_web_specialist_v51.pkl"
)

ENCODER_PATH = os.path.join(
    OUTPUT_DIR,
    "v51_web_label_encoder.pkl"
)

FEATURE_PATH = os.path.join(
    OUTPUT_DIR,
    "v51_features.txt"
)


joblib.dump(
    model,
    MODEL_PATH
)

joblib.dump(
    encoder,
    ENCODER_PATH
)

with open(FEATURE_PATH, "w") as f:

    for feature in FEATURES:
        f.write(feature + "\n")


print("\n" + "=" * 70)
print("V5.1 MODEL SAVED")
print("=" * 70)

print("Model   :", MODEL_PATH)
print("Encoder :", ENCODER_PATH)
print("Features:", FEATURE_PATH)

print("=" * 70)