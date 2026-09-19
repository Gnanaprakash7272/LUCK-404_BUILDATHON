import json
import requests
import pandas as pd
from collections import Counter

INPUT_PATH = r"C:\CYVORA\data\processed\features\cyvora_test_engineered.csv"
API_URL = "http://127.0.0.1:8000/predict"

df = pd.read_csv(INPUT_PATH)

# Get all real XSS samples
mask = (
    df["Label"]
    .astype(str)
    .str.contains("XSS", case=False, na=False)
)

samples = df.loc[mask].reset_index(drop=True)

print("=" * 70)
print("CYVORA V4 - XSS BATCH TEST")
print("=" * 70)
print("Actual XSS samples:", len(samples))
print()

correct = 0
wrong = 0
errors = 0
predictions = Counter()

for i, row in samples.iterrows():

    features = row.drop(labels=["Label"]).to_dict()

    features = {
        str(k): float(v)
        for k, v in features.items()
    }

    payload = {
        "features": features
    }

    try:
        response = requests.post(
            API_URL,
            json=payload,
            timeout=30
        )

        response.raise_for_status()

        result = response.json()["result"]

        prediction = str(result["prediction"])
        confidence = result["confidence"]

        predictions[prediction] += 1

        actual = str(row["Label"])

        # Normalize encoding for comparison
        actual_norm = actual.replace(" ", "").replace("ï¿½", "")
        prediction_norm = prediction.replace(" ", "").replace("ï¿½", "")

        if "XSS" in prediction_norm.upper():
            correct += 1
            status = "CORRECT"
        else:
            wrong += 1
            status = "WRONG"

        print(
            f"{i + 1:03d}/{len(samples)} | "
            f"{status:7s} | "
            f"Prediction: {prediction} | "
            f"Confidence: {confidence}"
        )

    except Exception as e:
        errors += 1

        print(
            f"{i + 1:03d}/{len(samples)} | "
            f"ERROR   | {e}"
        )

print()
print("=" * 70)
print("XSS BATCH TEST SUMMARY")
print("=" * 70)

total_tested = correct + wrong

accuracy = (
    correct / total_tested
    if total_tested > 0
    else 0
)

print("Total samples :", len(samples))
print("Correct       :", correct)
print("Wrong         :", wrong)
print("API errors    :", errors)
print(f"Accuracy      : {accuracy:.4f}")
print(f"Accuracy (%)  : {accuracy * 100:.2f}%")

print()
print("Prediction distribution:")
for label, count in predictions.items():
    print(f"  {label}: {count}")

print("=" * 70)