# CYVORA - Cyber Vulnerability and Attack Progression Intelligence

CYVORA is a machine-learning-powered cybersecurity intelligence project designed for vulnerability management, threat detection, alert correlation, attack progression modeling, and automated response.

## Directory Structure

```text
cyvora/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── vulnerability/
│
├── models/
│   ├── detector/
│   ├── stage/
│   └── predictor/
│
├── src/
│   ├── data/
│   ├── preprocessing/
│   ├── detection/
│   ├── correlation/
│   ├── stage/
│   ├── vulnerability/
│   ├── prediction/
│   ├── explainability/
│   └── response/
│
├── dashboard/
├── api/
├── notebooks/
├── tests/
│
├── requirements.txt
├── config.yaml
└── README.md
```

## System Components

- **Data Management (`src/data`, `data/`)**: Pipelines for ingesting raw cyber telemetry, processed Datasets, and vulnerability data (CVE/NVD).
- **Preprocessing (`src/preprocessing/`)**: Data normalization, cleaning, and feature engineering.
- **Threat Detection (`src/detection/`, `models/detector/`)**: Anomaly and threat detection algorithms.
- **Alert & Event Correlation (`src/correlation/`)**: Logic to correlate disparate security events into attack chains.
- **Attack Stage Identification (`src/stage/`, `models/stage/`)**: Classifying and tracking progression stages (e.g., MITRE ATT&CK matrix alignment).
- **Vulnerability Intelligence (`src/vulnerability/`)**: Vulnerability risk assessment and severity scoring.
- **Progression Prediction (`src/prediction/`, `models/predictor/`)**: Predictive models for future attack paths and impact.
- **Explainable AI (`src/explainability/`)**: Interpretable ML models and feature attribution (SHAP/LIME).
- **Response & Mitigation (`src/response/`)**: Automated security response generation and actionable recommendations.
- **API & Dashboard (`api/`, `dashboard/`)**: Interfaces for visualization and system integration.

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configuration:
   Adjust settings in `config.yaml`.
   
