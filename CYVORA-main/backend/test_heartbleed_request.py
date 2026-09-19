import json
import requests
import sys

URL = "http://127.0.0.1:8000/predict"
REQUEST_FILE = "backend/heartbleed_api_request.json"

print("=" * 65)
print("             CYVORA - HEARTBLEED API TEST RUN")
print("=" * 65)

try:
    with open(REQUEST_FILE, "r", encoding="utf-8") as f:
        payload = json.load(f)

    if "source_id" not in payload:
        payload["source_id"] = "SRC_HEARTBLEED_VERIFY"

    features = payload.get("features", {})
    print(f"Loaded {len(features)} network features from {REQUEST_FILE}")
    print(f"Target Port        : {features.get('Destination Port')}")
    print(f"Flow Duration      : {features.get('Flow Duration')} µs")
    print(f"Total Bwd Length   : {features.get('Total Length of Bwd Packets')} bytes")
    print(f"Source ID          : {payload['source_id']}")
    print("-" * 65)

    response = requests.post(URL, json=payload, timeout=10)
    print(f"HTTP Status        : {response.status_code}")

    data = response.json()

    if response.status_code == 200:
        res = data.get("result", {})
        resp = data.get("response", {})
        prev = data.get("prevention", {})

        print("\n" + "=" * 65)
        print("                 DETECTION & RESPONSE RESULT")
        print("=" * 65)
        print(f"  Prediction       : {res.get('prediction')}")
        print(f"  Confidence       : {res.get('confidence', 0) * 100:.2f}%")
        print(f"  Is Attack        : {res.get('is_attack')}")
        print(f"  Severity         : {res.get('severity')}")
        print(f"  Model Version    : {res.get('model_version')}")
        print(f"  Decision Engine  : {res.get('decision_source')}")
        print(f"  Response Action  : {resp.get('response_action')}")
        print(f"  Prevention Action: {resp.get('prevention', {}).get('action', prev.get('action'))}")
        print(f"  Enforcement      : {resp.get('prevention', {}).get('enforced', True)}")
        print("=" * 65)
        print("\n[SUCCESS] Heartbleed attack detected and blocked successfully!")

    elif response.status_code == 403:
        print("\n[BLOCKED] Prevention engine enforced BLOCK on this source:")
        print(json.dumps(data, indent=2))

    else:
        print("\nAPI Response:")
        print(json.dumps(data, indent=2))

except requests.exceptions.ConnectionError:
    print("\n[ERROR] CYVORA backend is not reachable at", URL)
    print("Ensure the backend is running with: python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000")
    sys.exit(1)
except Exception as e:
    print("\n[ERROR]", str(e))
    sys.exit(1)
