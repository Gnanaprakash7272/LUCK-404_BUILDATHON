import json
import pandas as pd

TEST_PATH = r"C:\CYVORA\data\processed\splits\test.csv"
OUTPUT_PATH = r"C:\CYVORA\backend\heartbleed_request.json"

df = pd.read_csv(TEST_PATH)

# Find the real Heartbleed sample
row = df[df["Label"].astype(str).str.strip().str.lower() == "heartbleed"]

if row.empty:
    raise ValueError("Heartbleed sample not found")

row = row.iloc[0]

# Remove label because API expects only features
features = row.drop(labels=["Label"]).to_dict()

# Convert NumPy values to normal Python numbers
features = {
    str(k): float(v) if pd.notna(v) else 0.0
    for k, v in features.items()
}

payload = {
    "features": features
}

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)

print("SUCCESS")
print("Source label :", row["Label"])
print("Features     :", len(features))
print("Output       :", OUTPUT_PATH)