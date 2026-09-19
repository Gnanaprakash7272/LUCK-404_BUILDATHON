export interface ModelMetric {
  name: string;
  value: number | null; // e.g. 0.9985 or null if N/A
  percentage: string;   // e.g. "99.86%" or "N/A"
  description: string;
  isReal: boolean;
}

export interface ModelVersionInfo {
  version: string;
  name: string;
  date: string;
  algorithm: string;
  focus: string;
  keyEnhancement: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'EXPERIMENTAL';
  metrics?: {
    accuracy?: number;
    macroF1?: number;
    weightedF1?: number;
    rareAttackF1?: number;
  };
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  rank: number;
  description: string;
  category: 'core' | 'advanced';
}

export interface RareAttackMetric {
  className: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
  errorRate: number;
  status: 'OPTIMIZED' | 'IMPROVED' | 'UNDER_EVALUATION';
}
