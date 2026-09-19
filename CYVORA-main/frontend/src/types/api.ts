export interface PredictionRequest {
  features: Record<string, number | string>;
  source_id?: string;
}

export interface ResponseEngineResult {
  response_action: 'ALLOW' | 'ALERT' | 'RATE_LIMIT' | 'BLOCK' | string;
  severity: string;
  confidence: number | null;
  confidence_aware?: boolean;
  timestamp?: string;
}

export interface PreventionEngineResult {
  enforced: boolean;
  action: 'ALLOW' | 'ALERT' | 'RATE_LIMIT' | 'BLOCK' | string;
  status: 'TRAFFIC_ALLOWED' | 'ALERT_TRIGGERED' | 'RATE_LIMITED' | 'TRAFFIC_BLOCKED' | 'TRAFFIC_MONITORED' | 'ATTACK_BLOCKED' | string;
  source_id?: string;
  message?: string;
  duration_seconds?: number;
  timestamp?: string;
}

export interface PredictionResult {
  prediction: string;
  prediction_id: number;
  confidence: number | null;
  is_attack: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  model_version: string;
  response_action?: string;
  prevention_action?: string;
  prevention_status?: string;
  enforced?: boolean;
  source_id?: string;
  attack_type?: string;
}

export interface PredictionResponse {
  success: boolean;
  result: PredictionResult;
  response?: ResponseEngineResult;
  prevention?: PreventionEngineResult;
  error?: string;
}

export interface PreventionStatusData {
  status: 'active' | 'inactive' | string;
  blocked_sources: number;
  rate_limited_sources: number;
  block_duration_seconds: number;
  rate_limit_duration_seconds: number;
  current_action?: 'ALLOW' | 'ALERT' | 'RATE_LIMIT' | 'BLOCK' | string;
  current_status?: 'TRAFFIC_ALLOWED' | 'ALERT_TRIGGERED' | 'RATE_LIMITED' | 'TRAFFIC_BLOCKED' | string;
  enforced?: boolean;
}

export interface PreventionStatusResponse {
  success: boolean;
  prevention: PreventionStatusData;
}

export interface ModelInfoResponse {
  model_version: string;
  model_type: string;
  feature_count: number | null;
  model_loaded: boolean;
  prevention_engine?: {
    status: string;
    enforcement: string;
    supported_actions: string[];
  };
}

export interface ApiStatusResponse {
  api: string;
  status: string;
  backend: string;
  model: string;
  prediction_engine: string;
  prevention_engine?: string;
  enforcement?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  model_version?: string;
  prevention_engine?: string;
}

export interface BackendSecurityEvent {
  security_event_id: number;
  timestamp: string;
  source_id: string;
  event_type: string;
  raw_features?: Record<string, any>;
  prediction: string | null;
  confidence: number | null;
  is_attack: boolean | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string | null;
  response_action: string | null;
  response_status: string | null;
  port?: number;
  protocol?: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'SSH' | 'FTP' | 'DNS';
  source_ip?: string;
  destination_ip?: string;
  flow_duration_us?: number;
  packet_count?: number;
  byte_count?: number;
  anomaly_score?: number | null;
  is_anomalous?: boolean | null;
  novelty_label?: string | null;
  risk_score?: number | null;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string | null;
  verified?: boolean | null;
  verification_status?: 'VERIFIED' | 'FAILED' | 'NOT_APPLICABLE' | string | null;
  verification_evidence?: string | null;
}

export interface ResponseVerificationResult {
  verified: boolean;
  verification_status: 'VERIFIED' | 'FAILED' | 'NOT_APPLICABLE' | string;
  action: string;
  evidence: string;
  verified_at?: string;
}

export interface RecentEventsResponse {
  success: boolean;
  count: number;
  events: BackendSecurityEvent[];
  error?: string;
  detail?: string;
}

export interface BackendStatsData {
  total_predictions: number;
  total_attacks: number;
  total_benign: number;
  attack_rate_pct: number;
  predictions_by_label: Record<string, number>;
  response_actions_by_type: Record<string, number>;
}

export interface BackendStatsResponse {
  success: boolean;
  stats?: BackendStatsData;
  error?: string;
  detail?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username?: string | null;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthLoginResponse {
  access_token: string;
  token_type: string;
}


