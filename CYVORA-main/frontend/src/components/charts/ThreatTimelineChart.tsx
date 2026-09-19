import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Props {
  height?: number;
}

const DEFAULT_TIMELINE = [
  { time: '00:00', threats: 12, benign: 420, rare: 0 },
  { time: '02:00', threats: 8, benign: 380, rare: 0 },
  { time: '04:00', threats: 15, benign: 310, rare: 1 },
  { time: '06:00', threats: 24, benign: 510, rare: 0 },
  { time: '08:00', threats: 68, benign: 1200, rare: 2 },
  { time: '10:00', threats: 142, benign: 2450, rare: 3 },
  { time: '12:00', threats: 198, benign: 2890, rare: 1 },
  { time: '14:00', threats: 245, benign: 3120, rare: 4 },
  { time: '16:00', threats: 180, benign: 2780, rare: 2 },
  { time: '18:00', threats: 120, benign: 2100, rare: 1 },
  { time: '20:00', threats: 85, benign: 1640, rare: 1 },
  { time: '22:00', threats: 42, benign: 920, rare: 0 },
];

export const ThreatTimelineChart: React.FC<Props> = ({ height = 260 }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEFAULT_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="rareGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9333EA" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-lg min-w-[160px]">
                      <div className="font-bold text-slate-800 mb-1.5 font-mono-code">TIMESTAMP: {label}</div>
                      <div className="flex justify-between text-red-600 mb-1 font-semibold">
                        <span>Threats Detected:</span>
                        <span className="font-mono-code font-bold">{payload[0]?.value}</span>
                      </div>
                      <div className="flex justify-between text-purple-700 mb-1 font-semibold">
                        <span>Rare Attacks:</span>
                        <span className="font-mono-code font-bold">{payload[1]?.value}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                        <span>Benign Background:</span>
                        <span className="font-mono-code">
                          {((payload[0]?.payload as any)?.benign || 0).toLocaleString()} flows
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="threats"
              stroke="#DC2626"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#threatGradient)"
              name="Threats"
            />
            <Area
              type="monotone"
              dataKey="rare"
              stroke="#9333EA"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#rareGradient)"
              name="Rare Attacks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-red-600 rounded-full" />
          <span className="text-slate-700 font-mono-code font-medium">Network Threats</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-purple-600 rounded-full" />
          <span className="text-purple-700 font-mono-code font-medium">Rare Attack Detections</span>
        </div>
      </div>
    </div>
  );
};
