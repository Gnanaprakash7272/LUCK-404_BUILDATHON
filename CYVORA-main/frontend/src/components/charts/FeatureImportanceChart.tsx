import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { TOP_FEATURE_IMPORTANCES } from '../../data/featureImportance';

interface Props {
  limit?: number;
}

export const FeatureImportanceChart: React.FC<Props> = ({ limit = 12 }) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CORE' | 'ENGINEERED'>('ALL');

  const filtered = TOP_FEATURE_IMPORTANCES.filter((f) => {
    if (selectedCategory === 'CORE') return f.category === 'core';
    if (selectedCategory === 'ENGINEERED') return f.category === 'advanced';
    return true;
  }).slice(0, limit);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-0.5 rounded font-semibold transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Features
          </button>
          <button
            onClick={() => setSelectedCategory('CORE')}
            className={`px-2.5 py-0.5 rounded font-semibold transition-colors ${
              selectedCategory === 'CORE'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Core Only
          </button>
          <button
            onClick={() => setSelectedCategory('ENGINEERED')}
            className={`px-2.5 py-0.5 rounded font-semibold transition-colors ${
              selectedCategory === 'ENGINEERED'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Engineered Only
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono-code font-medium">
          Gini Importance Metric
        </span>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filtered}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748B"
              fontSize={11}
              tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="#334155"
              fontSize={11}
              width={135}
              tick={{ fill: '#334155', fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-lg min-w-[220px]">
                      <div className="font-bold text-sky-700 font-mono-code mb-1">
                        #{item.rank} {item.feature}
                      </div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>Relative Importance:</span>
                        <span className="font-mono-code font-bold text-emerald-700">
                          {(item.importance * 100).toFixed(3)}%
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 pt-1 border-t border-slate-100">
                        {item.description}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {filtered.map((entry, idx) => (
                <Cell
                  key={`imp-cell-${idx}`}
                  fill={entry.category === 'core' ? '#0284C7' : '#6366F1'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
