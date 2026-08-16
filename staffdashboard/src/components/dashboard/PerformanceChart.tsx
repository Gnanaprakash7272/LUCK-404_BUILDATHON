import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export const PerformanceChart: React.FC = () => {
  const chartData = [
    { week: 'Week 1', avg_score: 78, attendance_pct: 86, at_risk_count: 5 },
    { week: 'Week 2', avg_score: 76, attendance_pct: 84, at_risk_count: 4 },
    { week: 'Week 3', avg_score: 72, attendance_pct: 79, at_risk_count: 6 },
    { week: 'Week 4', avg_score: 75, attendance_pct: 82, at_risk_count: 5 },
    { week: 'Week 5', avg_score: 79, attendance_pct: 85, at_risk_count: 4 },
    { week: 'Week 6 (Current)', avg_score: 74, attendance_pct: 81, at_risk_count: 4 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Class Performance & Attendance Trends
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Weekly average test scores (%) vs class attendance rate (%) over current semester
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            <span className="text-slate-700">Average Quiz Score (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-700">Attendance Rate (%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="attendColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="avg_score"
              name="Avg Test Score (%)"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreColor)"
            />
            <Area
              type="monotone"
              dataKey="attendance_pct"
              name="Attendance Rate (%)"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#attendColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
