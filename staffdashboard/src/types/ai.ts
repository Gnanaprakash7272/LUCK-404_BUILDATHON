export interface Evidence {
  attendance_pct: number;
  weak_subject: string;
  weak_subject_avg: number;
  pending_assignments: number;
  trend: 'Declining' | 'Stable' | 'Improving' | string;
  trend_detail?: string;
}

export interface AtRiskStudent {
  student_id: string | number;
  name?: string;
  student_name?: string;
  roll_number?: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  weak_subject: string;
  trend?: string;
  pending_assignments?: number;
  evidence?: Evidence;
  explanation?: string;
  recommendation: string;
  generated_at?: string;
}
