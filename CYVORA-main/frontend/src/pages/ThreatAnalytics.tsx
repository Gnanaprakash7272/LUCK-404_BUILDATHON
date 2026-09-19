import React from 'react';
import { Card } from '../components/common/Card';
import { AttackDistributionChart } from '../components/charts/AttackDistributionChart';
import { ThreatSeverityDonut } from '../components/charts/ThreatSeverityDonut';
import { ThreatTimelineChart } from '../components/charts/ThreatTimelineChart';
import { FeatureImportanceChart } from '../components/charts/FeatureImportanceChart';

export const ThreatAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5 font-mono-code text-xs">
          <span className="p-1 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
            TELEMETRY ANALYTICS
          </span>
          <span className="text-slate-500 font-medium">/ Multidimensional Threat Insights</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono-code">
          THREAT ANALYTICS & DISTRIBUTION
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
          Statistical distribution of intrusion attempts across all 15 CYVORA classes, risk triage proportions, and temporal trends.
        </p>
      </div>

      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="15-Class Attack Distribution"
            subtitle="Full multiclass representation including high-frequency and rare attack classes"
          >
            <AttackDistributionChart />
          </Card>
        </div>

        <div>
          <Card
            title="Severity Risk Stratification"
            subtitle="Threat triage breakdown into Low, Medium, High, and Critical tiers"
          >
            <ThreatSeverityDonut />
          </Card>
        </div>
      </div>

      {/* Bottom Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card
            title="Threat Activity Timeline"
            subtitle="24-Hour temporal fluctuation of detected network anomalies"
          >
            <ThreatTimelineChart height={280} />
          </Card>
        </div>

        <div>
          <Card
            title="Feature Importance Ranking (Gini Attribution)"
            subtitle="Top mathematical features discriminating benign vs malicious network flows"
          >
            <FeatureImportanceChart limit={10} />
          </Card>
        </div>
      </div>
    </div>
  );
};
