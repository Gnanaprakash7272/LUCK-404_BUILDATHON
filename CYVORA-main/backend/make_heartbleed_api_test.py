import json
import pandas as pd

INPUT_PATH = r"C:\CYVORA\data\processed\features\cyvora_test_engineered.csv"
OUTPUT_PATH = r"C:\CYVORA\backend\heartbleed_api_request.json"

# Load the already-engineered test dataset
df = pd.read_csv(INPUT_PATH)

# Find the real Heartbleed sample
mask = (
    df["Label"]
    .astype(str)
    .str.strip()
    .str.lower()
    == "heartbleed"
)

heartbleed = df.loc[mask]

if heartbleed.empty:
    raise ValueError("Heartbleed sample not found.")

# There should be exactly one Heartbleed sample
row = heartbleed.iloc[0]

# Remove label; keep the 87 model features
features = row.drop(labels=["Label"]).to_dict()

# Convert values to normal Python floats
features = {
    str(key): float(value)
    for key, value in features.items()
}

payload = {
    "features": features
}

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)

print("=" * 60)
print("CYVORA HEARTBLEED API TEST")
print("=" * 60)
print("Original label :", row["Label"])
print("Feature count  :", len(features))
print("Output file    :", OUTPUT_PATH)
print("=" * 60)