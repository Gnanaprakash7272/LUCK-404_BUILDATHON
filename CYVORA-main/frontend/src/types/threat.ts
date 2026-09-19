export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AttackCategory = 
  | 'BENIGN'
  | 'Bot'
  | 'DDoS'
  | 'DoS GoldenEye'
  | 'DoS Hulk'
  | 'DoS Slowhttptest'
  | 'DoS slowloris'
  | 'FTP-Patator'
  | 'Heartbleed'
  | 'Infiltration'
  | 'PortScan'
  | 'SSH-Patator'
  | 'Web Attack – Brute Force'
  | 'Web Attack – Sql Injection'
  | 'Web Attack – XSS';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'SSH' | 'FTP' | 'DNS';
  prediction: string;
  confidence: number;
  severity: SeverityLevel;
  status: 'ACTIVE' | 'MITIGATED' | 'ANALYZING' | 'BLOCKED';
  isAttack: boolean;
  flowDurationUs: number;
  packetCount: number;
  byteCount: number;
  anomalyScore?: number;
  isAnomalous?: boolean;
  noveltyLabel?: string;
  riskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  responseAction?: string;
  responseStatus?: string;
  verified?: boolean;
  verificationStatus?: 'VERIFIED' | 'FAILED' | 'NOT_APPLICABLE' | string;
  verificationEvidence?: string;
  isSimulated?: boolean;
}

export interface AttackClassInfo {
  name: string;
  label: string;
  isRare: boolean;
  severity: SeverityLevel;
  category: 'Benign' | 'Denial of Service' | 'Web Attack' | 'Brute Force' | 'Exploit / Infiltration' | 'Reconnaissance' | 'Botnet';
  description: string;
  mitreTactic: string;
  mitreId: string;
  typicalPorts: number[];
  indicators: string[];
}

export interface ThreatSummaryStats {
  totalFlows: number;
  threatsDetected: number;
  benignTraffic: number;
  detectionRate: number;
  avgConfidence: number;
}
