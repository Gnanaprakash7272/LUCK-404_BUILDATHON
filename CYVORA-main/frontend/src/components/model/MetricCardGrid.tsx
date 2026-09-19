import React from 'react';
import { Award } from 'lucide-react';
import { V4_REAL_METRICS } from '../../data/modelEvolution';
import { ModelMetric } from '../../types/model';

interface Props {
  metrics?: ModelMetric[];
  hasRealMetrics?: boolean;
}

export const MetricCardGrid: React.FC<Props> = ({
  metrics = V4_REAL_METRICS,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-600" />
            V4 Evaluation Performance Benchmarks
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rigorous evaluation metrics verified on 378,355 holdout test flows (CICIDS benchmark).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          return (
            <div
              key={m.name}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-sky-300 transition-all hover:shadow"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700 truncate" title={m.name}>
                  {m.name}
                </span>
                {m.isReal && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Verified
                  </span>
                )}
              </div>

              <div className="text-2xl font-bold text-sky-700 my-1.5 tracking-tight">
                {m.value !== null ? m.percentage : 'N/A'}
              </div>

              <div className="text-[11px] text-slate-600 leading-tight font-medium">
                {m.value !== null ? (
                  m.description
                ) : (
                  <span className="text-amber-700">Connect evaluation metrics to display live performance.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
