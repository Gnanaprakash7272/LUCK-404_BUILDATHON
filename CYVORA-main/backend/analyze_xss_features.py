import pandas as pd
import numpy as np

TRAIN_PATH = r"C:\CYVORA\data\processed\features\cyvora_train_engineered.csv"

df = pd.read_csv(TRAIN_PATH)

mask = (
    df["Label"]
    .astype(str)
    .str.contains("XSS|Brute Force", case=False, na=False)
)

web = df.loc[mask].copy()

xss = web[
    web["Label"].astype(str).str.contains("XSS", case=False, na=False)
]

brute = web[
    web["Label"].astype(str).str.contains("Brute Force", case=False, na=False)
]

print("=" * 80)
print("CYVORA XSS vs BRUTE FORCE FEATURE ANALYSIS")
print("=" * 80)

print("XSS samples         :", len(xss))
print("Brute Force samples :", len(brute))

results = []

numeric_features = [
    c for c in web.columns
    if c != "Label" and pd.api.types.is_numeric_dtype(web[c])
]

for feature in numeric_features:

    x = pd.to_numeric(xss[feature], errors="coerce").replace(
        [np.inf, -np.inf], np.nan
    ).dropna()

    b = pd.to_numeric(brute[feature], errors="coerce").replace(
        [np.inf, -np.inf], np.nan
    ).dropna()

    if len(x) == 0 or len(b) == 0:
        continue

    x_mean = x.mean()
    b_mean = b.mean()

    pooled_std = np.sqrt(
        ((len(x) - 1) * x.var() +
         (len(b) - 1) * b.var()) /
        (len(x) + len(b) - 2)
    )

    if pooled_std == 0 or np.isnan(pooled_std):
        effect = 0
    else:
        effect = abs(x_mean - b_mean) / pooled_std

    results.append({
        "Feature": feature,
        "XSS_Mean": x_mean,
        "Brute_Mean": b_mean,
        "Effect_Size": effect
    })

result_df = pd.DataFrame(results)

result_df = result_df.sort_values(
    "Effect_Size",
    ascending=False
)

print()
print("TOP 25 DISCRIMINATIVE FEATURES")
print("=" * 80)

print(
    result_df.head(25).to_string(
        index=False
    )
)

output_path = r"C:\CYVORA\data\processed\analysis\xss_vs_bruteforce_features.csv"

result_df.to_csv(
    output_path,
    index=False
)

print()
print("Saved:", output_path)