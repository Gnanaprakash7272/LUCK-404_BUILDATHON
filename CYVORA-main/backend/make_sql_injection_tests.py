import json
import pandas as pd

INPUT_PATH = r"C:\CYVORA\data\processed\features\cyvora_test_engineered.csv"
OUTPUT_DIR = r"C:\CYVORA\backend"

df = pd.read_csv(INPUT_PATH)

mask = (
    df["Label"]
    .astype(str)
    .str.contains("Sql Injection", case=False, na=False)
)

samples = df.loc[mask].reset_index(drop=True)

if samples.empty:
    raise ValueError("SQL Injection samples not found.")

print("=" * 60)
print("CYVORA SQL INJECTION API TESTS")
print("=" * 60)
print("Samples found:", len(samples))

for i, row in samples.iterrows():

    features = row.drop(labels=["Label"]).to_dict()

    features = {
        str(key): float(value)
        for key, value in features.items()
    }

    payload = {
        "features": features
    }

    output_path = (
        f"{OUTPUT_DIR}\\sql_injection_request_{i + 1}.json"
    )

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(
        f"Created sample {i + 1}: "
        f"{output_path}"
    )

print("=" * 60)
print("DONE")
print("=" * 60)