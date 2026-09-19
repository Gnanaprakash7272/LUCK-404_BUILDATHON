import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SeverityCount {
  name: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  count: number;
  color: string;
}

interface Props {
  data?: SeverityCount[];
}

const DEFAULT_SEVERITY_DATA: SeverityCount[] = [
  { name: 'LOW', count: 314473, color: '#059669' },
  { name: 'MEDIUM', count: 15215, color: '#D97706' },
  { name: 'HIGH', count: 29447, color: '#DC2626' },
  { name: 'CRITICAL', count: 19214, color: '#DB2777' },
];

export const ThreatSeverityDonut: React.FC<Props> = ({ data = DEFAULT_SEVERITY_DATA }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div className="w-full h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={85}
              paddingAngle={3}
              dataKey="count"
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SeverityCount;
                  const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                  return (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-lg min-w-[140px]">
                      <div className="font-bold mb-1" style={{ color: item.color }}>
                        {item.name} SEVERITY
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Count:</span>
                        <span className="font-mono-code font-bold">{item.count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px] mt-0.5">
                        <span>Share:</span>
                        <span className="font-mono-code">{pct}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono-code font-bold">
            TOTAL FLOWS
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono-code">
            {total > 1000 ? `${(total / 1000).toFixed(0)}k` : total}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 w-full mt-2 pt-2 border-t border-slate-100">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs px-2.5 py-1 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-800 font-mono-code font-semibold">{item.name}</span>
            </div>
            <span className="text-slate-600 font-mono-code text-[11px] font-bold">
              {((item.count / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[10px] text-slate-500 text-center italic">
        * Severity mapped via backend confidence rule hierarchy & risk matrix.
      </div>
    </div>
  );
};
