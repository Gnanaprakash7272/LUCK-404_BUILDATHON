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
import { getSeverityColorHex } from '../../utils/severity';

const INITIAL_DISTRIBUTION = [
  { name: 'BENIGN', count: 314473, isRare: false, severity: 'LOW' },
  { name: 'DoS Hulk', count: 25928, isRare: false, severity: 'HIGH' },
  { name: 'DDoS', count: 19203, isRare: false, severity: 'CRITICAL' },
  { name: 'PortScan', count: 13623, isRare: false, severity: 'MEDIUM' },
  { name: 'DoS GoldenEye', count: 1543, isRare: false, severity: 'HIGH' },
  { name: 'FTP-Patator', count: 890, isRare: false, severity: 'HIGH' },
  { name: 'DoS slowloris', count: 808, isRare: false, severity: 'MEDIUM' },
  { name: 'DoS Slowhttptest', count: 784, isRare: false, severity: 'MEDIUM' },
  { name: 'SSH-Patator', count: 483, isRare: false, severity: 'HIGH' },
  { name: 'Bot', count: 293, isRare: false, severity: 'HIGH' },
  { name: 'Web Attack – Brute Force', count: 220, isRare: true, severity: 'HIGH' },
  { name: 'Web Attack – XSS', count: 98, isRare: true, severity: 'HIGH' },
  { name: 'Infiltration', count: 6, isRare: true, severity: 'CRITICAL' },
  { name: 'Web Attack – Sql Injection', count: 3, isRare: true, severity: 'CRITICAL' },
  { name: 'Heartbleed', count: 2, isRare: true, severity: 'CRITICAL' },
];

interface Props {
  showBenign?: boolean;
  scaleType?: 'linear' | 'log';
}

export const AttackDistributionChart: React.FC<Props> = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ATTACKS_ONLY' | 'RARE_ONLY'>('ATTACKS_ONLY');

  const filteredData = INITIAL_DISTRIBUTION.filter((item) => {
    if (activeFilter === 'ATTACKS_ONLY') return item.name !== 'BENIGN';
    if (activeFilter === 'RARE_ONLY') return item.isRare;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveFilter('ATTACKS_ONLY')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeFilter === 'ATTACKS_ONLY'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Attacks (14)
          </button>
          <button
            onClick={() => setActiveFilter('RARE_ONLY')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeFilter === 'RARE_ONLY'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rare Attacks (5)
          </button>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 15 Classes (Inc. Benign)
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono-code font-medium">
          15 CYVORA Evaluation Classes
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748B"
              fontSize={11}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#334155"
              fontSize={11}
              width={135}
              tick={{ fill: '#334155', fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-lg min-w-[200px]">
                      <div className="font-bold text-slate-900 mb-1">{data.name}</div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Flows / Support:</span>
                        <span className="font-mono-code font-bold text-sky-700">
                          {data.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Severity:</span>
                        <span
                          className="font-mono-code font-bold"
                          style={{ color: getSeverityColorHex(data.severity) }}
                        >
                          {data.severity}
                        </span>
                      </div>
                      {data.isRare && (
                        <div className="mt-2 pt-1 border-t border-purple-200 text-purple-700 text-[10px] font-mono-code font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                          CYVORA RARE ATTACK TARGET
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {filteredData.map((entry, index) => {
                const color = entry.isRare
                  ? '#9333EA' // Purple for rare attacks
                  : entry.name === 'BENIGN'
                  ? '#059669'
                  : entry.severity === 'CRITICAL'
                  ? '#DB2777'
                  : entry.severity === 'HIGH'
                  ? '#DC2626'
                  : '#0284C7';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
