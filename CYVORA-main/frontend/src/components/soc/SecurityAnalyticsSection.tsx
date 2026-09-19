import React from 'react';
import { BarChart2, Activity, PieChart } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const SecurityAnalyticsSection: React.FC = () => {
  const metrics = [
    { label: 'DETECTION ACCURACY', value: '99.86%', desc: 'Overall Test Set Accuracy', color: 'text-sky-700', bg: 'bg-sky-50/50', border: 'border-sky-200' },
    { label: 'WEIGHTED F1 SCORE', value: '99.86%', desc: 'Imbalanced Weighted Precision', color: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
    { label: 'MACRO F1 SCORE', value: '87.5%', desc: 'Unweighted Minority Class Score', color: 'text-purple-700', bg: 'bg-purple-50/50', border: 'border-purple-200' },
    { label: 'THREAT CLASSES', value: '15', desc: 'CICIDS-2017 Class Taxonomy', color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-200' },
    { label: 'AI FEATURES', value: '83', desc: 'Flow Duration, Packets, Flags', color: 'text-slate-800', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  const timelineData = [
    { time: '00:00', benign: 1200, threat: 45 },
    { time: '04:00', benign: 1400, threat: 30 },
    { time: '08:00', benign: 2800, threat: 190 },
    { time: '12:00', benign: 3900, threat: 420 },
    { time: '16:00', benign: 3500, threat: 280 },
    { time: '20:00', benign: 2100, threat: 95 },
    { time: '24:00', benign: 1600, threat: 50 },
  ];

  const distributionData = [
    { name: 'DoS / DDoS', value: 380688, color: '#0284C7' },
    { name: 'PortScan', value: 158930, color: '#38BDF8' },
    { name: 'Web Attacks', value: 2180, color: '#7C3AED' },
    { name: 'Bot', value: 1966, color: '#D97706' },
    { name: 'Brute Force', value: 13835, color: '#DC2626' },
    { name: 'Rare (Heartbleed/Infil)', value: 47, color: '#059669' },
  ];

  return (
    <section className="space-y-6 font-mono-code">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wider flex items-center gap-2 uppercase">
            <BarChart2 className="w-5 h-5 text-sky-600" />
            <span>SECURITY ANALYTICS & MODEL BENCHMARKS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ENTERPRISE PREDICTIVE METRICS & INTRUSION DISTRIBUTION TELEMETRY
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className={`white-card p-4 border ${m.border} ${m.bg} shadow-sm space-y-1.5`}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {m.label}
            </span>
            <div className={`text-2xl font-extrabold ${m.color}`}>
              {m.value}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {m.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-7 white-card rounded-xl p-5 border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Activity className="w-4 h-4 text-sky-600" />
              <span className="uppercase">24-HOUR DETECTION TIMELINE</span>
            </div>
            <span className="text-[11px]">FLOW VOLUME (EVENTS/HR)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorBenignLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorThreatLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748B" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="benign" stroke="#0284C7" fillOpacity={1} fill="url(#colorBenignLight)" name="Benign Traffic" />
                <Area type="monotone" dataKey="threat" stroke="#DC2626" fillOpacity={1} fill="url(#colorThreatLight)" name="Threat Detections" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="lg:col-span-5 white-card rounded-xl p-5 border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span className="uppercase">ATTACK DISTRIBUTION</span>
            </div>
            <span className="text-[11px]">SAMPLES</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={10} fontFamily="monospace" />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} fontFamily="monospace" width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#0284C7" radius={[0, 4, 4, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
