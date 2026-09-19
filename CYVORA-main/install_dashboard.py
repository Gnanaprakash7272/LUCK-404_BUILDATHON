from pathlib import Path

app = Path("backend/app/main.py")
text = app.read_text(encoding="utf-8")

# Existing root endpoint-ஐ dashboard HTML return செய்ய மாற்றுகிறோம்.
start = text.find('@app.get("/")')

if start == -1:
    print("Root endpoint not found in backend/app/main.py")
    raise SystemExit(1)

next_endpoint = text.find("\n@app.", start + 1)

if next_endpoint == -1:
    next_endpoint = len(text)

dashboard = r'''
@app.get("/")
def root():
    from fastapi.responses import HTMLResponse

    return HTMLResponse("""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CYVORA — AI Cyber Defense</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #070b12;
    color: #e8eef7;
}

header {
    height: 72px;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #1c2635;
    background: #0a0f18;
}

.logo {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 2px;
}

.logo span {
    color: #35d49a;
}

.status {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 14px;
}

.dot {
    width: 10px;
    height: 10px;
    background: #35d49a;
    border-radius: 50%;
    box-shadow: 0 0 12px #35d49a;
}

.container {
    max-width: 1400px;
    margin: auto;
    padding: 28px;
}

.hero {
    margin-bottom: 25px;
}

.hero h1 {
    margin: 0;
    font-size: 34px;
}

.hero p {
    color: #8d9aad;
    margin-top: 8px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.card {
    background: #0d131e;
    border: 1px solid #1c2737;
    border-radius: 14px;
    padding: 20px;
}

.card h3 {
    margin: 0 0 10px;
    color: #8d9aad;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.value {
    font-size: 25px;
    font-weight: 700;
}

.green {
    color: #35d49a;
}

.blue {
    color: #62a8ff;
}

.yellow {
    color: #f4c95d;
}

.red {
    color: #ff6262;
}

.section {
    margin-top: 22px;
}

.section h2 {
    font-size: 19px;
    margin-bottom: 14px;
}

.panel {
    background: #0d131e;
    border: 1px solid #1c2737;
    border-radius: 14px;
    padding: 22px;
}

button {
    border: 0;
    border-radius: 10px;
    padding: 13px 22px;
    background: #35d49a;
    color: #06100c;
    font-weight: 700;
    cursor: pointer;
}

button:hover {
    opacity: .85;
}

.result {
    margin-top: 18px;
    display: none;
}

.result-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.small {
    color: #8d9aad;
    font-size: 12px;
    margin-bottom: 5px;
}

.big {
    font-size: 21px;
    font-weight: 700;
}

pre {
    background: #070b12;
    padding: 15px;
    border-radius: 10px;
    overflow: auto;
    color: #b8c5d6;
}

@media(max-width: 900px) {
    .grid,
    .result-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media(max-width: 550px) {
    .grid,
    .result-grid {
        grid-template-columns: 1fr;
    }
}
</style>
</head>

<body>

<header>
    <div class="logo">CY<span>VORA</span></div>

    <div class="status">
        <div class="dot"></div>
        SYSTEM OPERATIONAL
    </div>
</header>

<div class="container">

    <div class="hero">
        <h1>AI Cyber Defense Dashboard</h1>
        <p>Real-time attack detection, response and prevention</p>
    </div>

    <div class="grid">

        <div class="card">
            <h3>Model</h3>
            <div class="value blue" id="model">Loading...</div>
        </div>

        <div class="card">
            <h3>Prediction Engine</h3>
            <div class="value green">ACTIVE</div>
        </div>

        <div class="card">
            <h3>Response Engine</h3>
            <div class="value green">ACTIVE</div>
        </div>

        <div class="card">
            <h3>Prevention Engine</h3>
            <div class="value green">ACTIVE</div>
        </div>

    </div>

    <div class="section">
        <h2>System Information</h2>

        <div class="panel">
            <div class="grid">

                <div>
                    <div class="small">API</div>
                    <div class="big green" id="api">Checking...</div>
                </div>

                <div>
                    <div class="small">Model Version</div>
                    <div class="big" id="model2">Checking...</div>
                </div>

                <div>
                    <div class="small">Classes</div>
                    <div class="big" id="classes">-</div>
                </div>

                <div>
                    <div class="small">Features</div>
                    <div class="big" id="features">-</div>
                </div>

            </div>
        </div>
    </div>

    <div class="section">
        <h2>Live Prediction Test</h2>

        <div class="panel">

            <p style="color:#8d9aad">
                Send a test traffic sample to the CYVORA V21.1 prediction engine.
            </p>

            <button onclick="runTest()">RUN PREDICTION</button>

            <div class="result" id="result">

                <div class="result-grid">

                    <div class="card">
                        <div class="small">Prediction</div>
                        <div class="big" id="prediction">-</div>
                    </div>

                    <div class="card">
                        <div class="small">Confidence</div>
                        <div class="big blue" id="confidence">-</div>
                    </div>

                    <div class="card">
                        <div class="small">Severity</div>
                        <div class="big" id="severity">-</div>
                    </div>

                    <div class="card">
                        <div class="small">Response</div>
                        <div class="big green" id="response">-</div>
                    </div>

                </div>

                <div style="margin-top:15px">
                    <div class="small">Prevention</div>
                    <div class="big" id="prevention">-</div>
                </div>

                <pre id="raw"></pre>

            </div>

        </div>
    </div>

</div>

<script>

async function loadSystem() {

    try {

        const health = await fetch("/health");
        const h = await health.json();

        document.getElementById("api").textContent =
            h.status === "healthy" ? "CONNECTED" : "ERROR";

        document.getElementById("model").textContent =
            h.model_version;

        document.getElementById("model2").textContent =
            h.model_version;

        const info = await fetch("/model-info");
        const i = await info.json();

        document.getElementById("classes").textContent =
            i.class_count + " classes";

        document.getElementById("features").textContent =
            i.final_feature_count + " features";

    } catch (e) {

        document.getElementById("api").textContent = "DISCONNECTED";

    }

}


async function runTest() {

    const payload = {
        features: {
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
        source_id: "BROWSER_TEST_001"
    };

    const resultBox = document.getElementById("result");
    resultBox.style.display = "block";

    document.getElementById("prediction").textContent = "Running...";
    document.getElementById("confidence").textContent = "...";

    try {

        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        const r = data.result;

        document.getElementById("prediction").textContent =
            r.prediction;

        document.getElementById("confidence").textContent =
            (r.confidence * 100).toFixed(2) + "%";

        document.getElementById("severity").textContent =
            r.severity;

        document.getElementById("response").textContent =
            data.response.response_action;

        document.getElementById("prevention").textContent =
            data.prevention.action +
            " — " +
            data.prevention.status;

        document.getElementById("raw").textContent =
            JSON.stringify(data, null, 2);

    } catch (e) {

        document.getElementById("prediction").textContent =
            "ERROR";

        document.getElementById("raw").textContent =
            e.toString();

    }

}

loadSystem();

</script>

</body>
</html>
""")
'''

new_text = text[:start] + dashboard + text[next_endpoint:]

app.write_text(new_text, encoding="utf-8")

print("CYVORA browser dashboard installed successfully.")
