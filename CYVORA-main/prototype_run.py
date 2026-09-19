import requests
import json

URL = "http://127.0.0.1:8000/predict"

payload = {
    "features": {
        "Destination Port": 80,
        "Flow Duration": 1000000,
        "Total Fwd Packets": 10,
        "Total Backward Packets": 8,
        "Total Length of Fwd Packets": 500,
        "Total Length of Bwd Packets": 400,
        "Fwd Packet Length Max": 100,
        "Fwd Packet Length Min": 20,
        "Fwd Packet Length Mean": 50,
        "Fwd Packet Length Std": 10,
        "Bwd Packet Length Max": 100,
        "Bwd Packet Length Min": 20,
        "Bwd Packet Length Mean": 50,
        "Bwd Packet Length Std": 10,
        "Flow Bytes/s": 900,
        "Flow Packets/s": 18,
        "Flow IAT Mean": 1000,
        "Flow IAT Std": 100,
        "Flow IAT Max": 5000,
        "Flow IAT Min": 100,
        "Fwd IAT Total": 5000,
        "Fwd IAT Mean": 500,
        "Fwd IAT Std": 100,
        "Fwd IAT Max": 2000,
        "Fwd IAT Min": 100,
        "Bwd IAT Total": 4000,
        "Bwd IAT Mean": 500,
        "Bwd IAT Std": 100,
        "Bwd IAT Max": 2000,
        "Bwd IAT Min": 100,
        "Fwd PSH Flags": 1,
        "Fwd URG Flags": 0,
        "Fwd Header Length": 200,
        "Bwd Header Length": 160,
        "Fwd Packets/s": 10,
        "Bwd Packets/s": 8,
        "Min Packet Length": 20,
        "Max Packet Length": 100,
        "Packet Length Mean": 50,
        "Packet Length Std": 10,
        "Packet Length Variance": 100,
        "FIN Flag Count": 0,
        "SYN Flag Count": 1,
        "RST Flag Count": 0,
        "PSH Flag Count": 1,
        "ACK Flag Count": 1,
        "URG Flag Count": 0,
        "ECE Flag Count": 0,
        "Down/Up Ratio": 0.8,
        "Average Packet Size": 50,
        "Init_Win_bytes_forward": 8192,
        "Init_Win_bytes_backward": 8192,
        "act_data_pkt_fwd": 5,
        "min_seg_size_forward": 20
    },
    "source_id": "TERMINAL_TEST_001"
}

print("\n" + "=" * 60)
print("             CYVORA V21.1 PROTOTYPE TEST")
print("=" * 60)

try:
    r = requests.post(URL, json=payload, timeout=30)

    print("\nHTTP STATUS :", r.status_code)

    data = r.json()
    print(json.dumps(data, indent=2))

    if r.status_code == 200:
        result = data.get("result", {})
        response = data.get("response", {})
        prevention = data.get("prevention", {})

        print("\n" + "-" * 60)
        print("              CYVORA FINAL RESULT")
        print("-" * 60)
        print("Prediction    :", result.get("prediction"))
        print("Confidence    :", f"{result.get('confidence', 0) * 100:.2f}%")
        print("Is Attack     :", result.get("is_attack"))
        print("Severity      :", result.get("severity"))
        print("Model         :", result.get("model_version"))
        print("Decision      :", result.get("decision_source"))
        print("Response      :", response.get("response_action"))
        print("Status        :", response.get("response_status"))
        print("Prevention    :", prevention.get("action"))
        print("Enforced      :", prevention.get("enforced"))
        print("-" * 60)

except requests.exceptions.ConnectionError:
    print("\nERROR: CYVORA backend is not running.")
    print("Start it first with your normal Uvicorn command.")

except Exception as e:
    print("\nERROR:", e)
