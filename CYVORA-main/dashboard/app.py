import streamlit as st
import requests
import json
import pandas as pd

API_URL = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="CYVORA — AI Cyber Defense Intelligence",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark cybersecurity aesthetic
st.markdown("""
<style>
    .reportview-container, .main .block-container {
        padding-top: 1.5rem;
    }
    .metric-card {
        background: #0d1527;
        border: 1px solid #1e2d4a;
        border-radius: 10px;
        padding: 16px;
        text-align: center;
    }
    .badge-critical {
        color: #ff3366;
        background: rgba(255, 51, 102, 0.15);
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        border: 1px solid rgba(255, 51, 102, 0.3);
    }
    .badge-high {
        color: #ff9900;
        background: rgba(255, 153, 0, 0.15);
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        border: 1px solid rgba(255, 153, 0, 0.3);
    }
    .badge-benign {
        color: #00ff88;
        background: rgba(0, 255, 136, 0.15);
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        border: 1px solid rgba(0, 255, 136, 0.3);
    }
</style>
""", unsafe_allow_html=True)

# Fetch backend health
backend_online = False
health_data = {}
model_info = {}
prevention_data = {}

try:
    h_resp = requests.get(f"{API_URL}/health", timeout=2)
    if h_resp.status_code == 200:
        backend_online = True
        health_data = h_resp.json()

    m_resp = requests.get(f"{API_URL}/model-info", timeout=2)
    if m_resp.status_code == 200:
        model_info = m_resp.json()

    p_resp = requests.get(f"{API_URL}/prevention/status", timeout=2)
    if p_resp.status_code == 200:
        prevention_data = p_resp.json().get("prevention", {})
except Exception:
    backend_online = False

# Header
col_head1, col_head2 = st.columns([3, 1])
with col_head1:
    st.title("🛡️ CYVORA AI CYBER DEFENSE")
    st.caption("Cyber Vulnerability, Attack Progression Intelligence & Automated Prevention Engine")

with col_head2:
    if backend_online:
        st.success("🟢 API ENGINE ONLINE (127.0.0.1:8000)")
    else:
        st.error("🔴 API BACKEND OFFLINE")

st.divider()

# System Metrics
col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    st.metric("Model Version", health_data.get("model_version", "V21.1"))

with col2:
    st.metric("Detection Engine", "Dual Ensemble + Web Specialist")

with col3:
    st.metric("Features Evaluated", f"{model_info.get('final_feature_count', 83)} Features")

with col4:
    blocked = prevention_data.get("blocked_sources", 0)
    st.metric("Active Blocked IPs", f"{blocked} Sources")

with col5:
    st.metric("Attack Classes", f"{model_info.get('class_count', 15)} Evaluated")

st.divider()

# Interactive Testing Section
st.subheader("🎯 Live Threat Simulation & Detection Engine")

# Preset samples
PRESETS = {
    "Heartbleed (CVE-2014-0160)": {
        "file": "backend/heartbleed_api_request.json",
        "desc": "Ultra-rare OpenSSL memory disclosure (Port 444, 7.8MB backward bytes)",
        "source": "SRC_HEARTBLEED_SIM",
        "default": {
            "Destination Port": 444.0, "Flow Duration": 119259012.0, "Total Fwd Packets": 2801.0,
            "Total Backward Packets": 2069.0, "Total Length of Fwd Packets": 12264.0,
            "Total Length of Bwd Packets": 7879536.0, "Fwd Header Length": 89632.0,
            "Bwd Header Length": 66208.0, "ACK Flag Count": 1.0, "Init_Win_bytes_forward": 235.0,
            "Init_Win_bytes_backward": 235.0, "act_data_pkt_fwd": 120.0, "min_seg_size_forward": 32.0
        }
    },
    "SQL Injection Probe": {
        "file": "backend/sql_injection_request_1.json",
        "desc": "High-risk web injection probe (Port 80, 73µs duration, ACK+URG flags)",
        "source": "SRC_SQLI_SIM",
        "default": {
            "Destination Port": 80.0, "Flow Duration": 73.0, "Total Fwd Packets": 1.0,
            "Total Backward Packets": 1.0, "Total Length of Fwd Packets": 0.0,
            "Total Length of Bwd Packets": 0.0, "Flow Packets/s": 27397.26, "ACK Flag Count": 1.0,
            "URG Flag Count": 1.0, "Init_Win_bytes_forward": 235.0, "Init_Win_bytes_backward": 235.0,
            "act_data_pkt_fwd": 0.0, "min_seg_size_forward": 32.0
        }
    },
    "Volumetric DDoS Flood": {
        "file": None,
        "desc": "Layer 4 SYN packet flood saturating network bandwidth",
        "source": "SRC_DDOS_SIM",
        "default": {
            "Destination Port": 80.0, "Flow Duration": 32412.0, "Total Fwd Packets": 15.0,
            "Total Backward Packets": 0.0, "Total Length of Fwd Packets": 1200.0,
            "Total Length of Bwd Packets": 0.0, "Flow Packets/s": 462.8, "SYN Flag Count": 1.0,
            "Init_Win_bytes_forward": 8192.0, "Init_Win_bytes_backward": -1.0,
            "act_data_pkt_fwd": 15.0, "min_seg_size_forward": 32.0
        }
    },
    "Standard Benign Web Traffic": {
        "file": "backend/test_request.json",
        "desc": "Normal balanced HTTP/DNS interaction with valid TCP handshake",
        "source": "SRC_BENIGN_SIM",
        "default": {
            "Destination Port": 53.0, "Flow Duration": 31060.0, "Total Fwd Packets": 2.0,
            "Total Backward Packets": 2.0, "Total Length of Fwd Packets": 138.0,
            "Total Length of Bwd Packets": 586.0, "Average Packet Size": 181.0,
            "Init_Win_bytes_forward": 65535.0, "Init_Win_bytes_backward": 65535.0,
            "act_data_pkt_fwd": 2.0, "min_seg_size_forward": 32.0
        }
    }
}

selected_preset_name = st.selectbox(
    "Choose Attack / Traffic Vector:",
    list(PRESETS.keys())
)

preset_info = PRESETS[selected_preset_name]
st.info(f"**Vector Details**: {preset_info['desc']}")

# Load payload
payload_features = preset_info["default"]
if preset_info["file"]:
    try:
        with open(preset_info["file"], "r", encoding="utf-8") as f:
            file_data = json.load(f)
            payload_features = file_data.get("features", preset_info["default"])
    except Exception:
        pass

source_id = st.text_input("Source Identifier (IP / Client ID):", value=preset_info["source"])

with st.expander("Inspect Raw Network Flow Features (Click to view/edit)", expanded=False):
    feature_text = st.text_area(
        "Features JSON:",
        value=json.dumps(payload_features, indent=2),
        height=240
    )

if st.button("🚀 Analyze Traffic with CYVORA AI", type="primary"):
    try:
        parsed_features = json.loads(feature_text)
        req_payload = {
            "features": parsed_features,
            "source_id": source_id
        }

        with st.spinner("Executing CYVORA Dual Ensemble + Web Specialist Model..."):
            res = requests.post(f"{API_URL}/predict", json=req_payload, timeout=10)

        if res.status_code == 200:
            data = res.json()
            pred = data.get("result", {})
            resp_engine = data.get("response", {})
            prev_engine = data.get("prevention", {})

            st.success("✅ Analysis Complete!")

            r_col1, r_col2, r_col3, r_col4 = st.columns(4)
            with r_col1:
                st.metric("Predicted Class", pred.get("prediction"))
            with r_col2:
                conf = pred.get("confidence", 0.0) * 100
                st.metric("Confidence", f"{conf:.2f}%")
            with r_col3:
                sev = pred.get("severity", "LOW")
                st.metric("Threat Severity", sev)
            with r_col4:
                action = resp_engine.get("response_action", "ALLOW")
                st.metric("Response Action", action)

            st.divider()

            # Detailed telemetry & prevention status
            d_col1, d_col2 = st.columns(2)
            with d_col1:
                st.write("**Intelligence Routing:**")
                st.write(f"- **Decision Source**: `{pred.get('decision_source')}`")
                st.write(f"- **Global Model Prediction**: `{pred.get('global_prediction')}` ({pred.get('global_confidence', 0)*100:.1f}%)")
                st.write(f"- **Web Specialist Prediction**: `{pred.get('web_specialist_prediction')}` ({pred.get('web_specialist_confidence', 0)*100:.1f}%)")

            with d_col2:
                st.write("**Automated Prevention Enforcement:**")
                st.write(f"- **Action**: `{prev_engine.get('action')}`")
                st.write(f"- **Status**: `{prev_engine.get('status')}`")
                st.write(f"- **Enforced**: `{prev_engine.get('enforced')}`")
                st.write(f"- **Source ID**: `{prev_engine.get('source_id')}`")

            with st.expander("View Full API Response JSON"):
                st.json(data)

        elif res.status_code == 403:
            st.error("🚫 ACCESS DENIED — SOURCE BLOCKED BY CYVORA PREVENTION ENGINE")
            st.json(res.json())

        elif res.status_code == 429:
            st.warning("⚠️ TRAFFIC RESTRICTED — SOURCE IS CURRENTLY RATE LIMITED")
            st.json(res.json())

        else:
            st.error(f"API Error ({res.status_code})")
            st.json(res.json())

    except Exception as e:
        st.error(f"Execution Error: {str(e)}")

st.divider()

# Model Architecture Breakdown
st.subheader("📊 Model Capabilities & Evaluated Attack Matrix")

tab1, tab2, tab3 = st.tabs(["MITRE Attack Classes", "Engineered Features", "Prevention Hierarchy"])

with tab1:
    classes_list = model_info.get("classes", [
        "BENIGN", "Heartbleed", "Web Attack – Sql Injection", "Web Attack – XSS",
        "Web Attack – Brute Force", "Infiltration", "DDoS", "PortScan", "Bot",
        "FTP-Patator", "SSH-Patator", "DoS Hulk", "DoS GoldenEye", "DoS slowloris", "DoS Slowhttptest"
    ])
    df_classes = pd.DataFrame({
        "Attack Class": classes_list,
        "Category": [
            "Normal Traffic" if c == "BENIGN" else
            "Exploit / Memory Leak" if "Heartbleed" in c else
            "Web Exploit" if "Web" in c else
            "Exploit / Foothold" if "Infiltration" in c else
            "Denial of Service" if ("DoS" in c or "DDoS" in c) else
            "Reconnaissance" if "PortScan" in c else
            "Brute Force" if "Patator" in c else "Botnet"
            for c in classes_list
        ],
        "Enforced Action": [
            "ALLOW" if c == "BENIGN" else
            "BLOCK (Immediate)" if ("Heartbleed" in c or "Sql" in c or "DDoS" in c or "Infiltration" in c) else
            "BLOCK / RATE_LIMIT"
            for c in classes_list
        ]
    })
    st.dataframe(df_classes, use_container_width=True)

with tab2:
    st.write("CYVORA transforms 54 base network telemetry features into **83 high-precision features** including:")
    col_feat1, col_feat2 = st.columns(2)
    with col_feat1:
        st.markdown("""
        - **`Fwd_Bwd_Length_Ratio`**: Asymmetric exfiltration indicator
        - **`Flow_IAT_Range` & `Fwd_IAT_Range`**: Inter-arrival timing dispersion
        - **`Window_Size_Ratio`**: TCP buffer allocation differential
        - **`Forward_Packet_Fraction`**: Directional packet skew
        """)
    with col_feat2:
        st.markdown("""
        - **`Web_Flow_Intensity`**: Volumetric payload per microsecond
        - **`TCP_Flag_Density`**: Anomaly density across FIN/SYN/RST/PSH/ACK/URG
        - **`IAT_Variability`**: Timing jitter detecting scripted bots
        - **`Packet_Size_Imbalance`**: Payload distribution skew
        """)

with tab3:
    st.markdown("""
    | Action | Trigger Threshold | Duration | Enforcement Strategy |
    | :--- | :--- | :--- | :--- |
    | **ALLOW** | Normal / BENIGN | N/A | Permitted directly without restriction |
    | **ALERT** | Low Confidence Anomaly (<70%) | Immediate | Telemetry tagged and flagged for SOC review |
    | **RATE_LIMIT** | Medium Confidence Threat (70% - 90%) | 120s | Temporary throttling via HTTP 429 |
    | **BLOCK** | High Confidence Threat (≥90%) | 300s | Complete ingress drop via HTTP 403 Forbidden |
    """)

st.caption("CYVORA SOC Defense Intelligence • Running locally on Streamlit & FastAPI")
