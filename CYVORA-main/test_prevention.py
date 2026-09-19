import requests
import json

API_URL = "http://127.0.0.1:8000"

print("=" * 60)
print("       CYVORA PREVENTION ENGINE TEST")
print("=" * 60)

try:
    r = requests.get(f"{API_URL}/prevention/status")
    print("\nPREVENTION STATUS:")
    print(json.dumps(r.json(), indent=2))

except Exception as e:
    print("\nERROR:", e)

print("\n" + "=" * 60)
print("       TEST COMPLETE")
print("=" * 60)
