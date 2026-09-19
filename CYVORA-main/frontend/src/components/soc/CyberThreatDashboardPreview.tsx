import React, { useState } from 'react';
import { ShieldAlert, Activity, Filter, CheckCircle, ArrowUpRight } from 'lucide-react';

export const CyberThreatDashboardPreview: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const stats = [
    { label: 'TOTAL EVENTS', value: '12,842', change: '+4.2%', color: 'text-slate-900', bg: 'bg-white', border: 'border-slate-300' },
    { label: 'THREATS DETECTED', value: '1,284', change: '+12%', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-300' },
    { label: 'CRITICAL THREATS', value: '37', change: '-2', color: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-300' },
    { label: 'DETECTION CONFIDENCE', value: '98.7%', change: 'HIGH ACCURACY', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  ];

  const tableRows = [
    { time: '14:32:08', source: '192.168.1.24', destination: '192.168.1.10', attackType: 'PortScan', confidence: '98.7%', severity: 'HIGH', status: 'BLOCKED' },
    { time: '14:32:11', source: '192.168.1.31', destination: '192.168.1.10', attackType: 'DDoS', confidence: '99.2%', severity: 'CRITICAL', status: 'DETECTED' },
    { time: '14:32:15', source: '192.168.1.42', destination: '192.168.1.10', attackType: 'Web Attack', confidence: '97.8%', severity: 'HIGH', status: 'DETECTED' },
    { time: '14:32:19', source: '172.16.0.88', destination: '192.168.1.10', attackType: 'Brute Force', confidence: '99.14%', severity: 'CRITICAL', status: 'BLOCKED' },
    { time: '14:32:24', source: '10.0.0.104', destination: '192.168.1.10', attackType: 'Heartbleed', confidence: '99.80%', severity: 'CRITICAL', status: 'ISOLATED' },
    { time: '14:32:28', source: '192.168.1.55', destination: '192.168.1.10', attackType: 'Infiltration', confidence: '96.4%', severity: 'MEDIUM', status: 'ANALYZING' },
  ];

  const filteredRows = filterSeverity === 'ALL'
    ? tableRows
    : tableRows.filter(r => r.severity === filterSeverity);

  return (
    <section className="space-y-6 font-mono-code">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-wider uppercase flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sky-600" />
            <span>LIVE THREAT MONITOR</span>
          </h2>
          <p className="text-xs text-slate-600 font-bold mt-0.5">
            REAL-TIME INTRUSION TELEMETRY & CLASSIFICATION FEED
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-700 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-sky-600" /> FILTER:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black border transition-colors ${
                filterSeverity === sev
                  ? 'bg-sky-100 text-sky-900 border-sky-400 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className={`white-card p-5 border ${s.border} ${s.bg} shadow-sm space-y-2`}>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>{s.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-black">
                {s.change}
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${s.color}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Threat Telemetry Table */}
      <div className="white-card rounded-xl border border-slate-300 bg-white overflow-hidden shadow-md">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-black uppercase tracking-wider text-sm">LIVE INTRUSION EVENTS STREAM</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>BUFFER ACTIVE</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-code text-xs">
            <thead className="bg-slate-900 text-cyan-300 uppercase text-xs tracking-wider border-b-2 border-slate-700 font-black">
              <tr>
                <th className="py-3.5 px-4 text-cyan-300">TIME</th>
                <th className="py-3.5 px-4 text-cyan-300">SOURCE</th>
                <th className="py-3.5 px-4 text-cyan-300">DESTINATION</th>
                <th className="py-3.5 px-4 text-cyan-300">ATTACK TYPE</th>
                <th className="py-3.5 px-4 text-cyan-300">CONFIDENCE</th>
                <th className="py-3.5 px-4 text-cyan-300">SEVERITY</th>
                <th className="py-3.5 px-4 text-cyan-300">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 bg-white">
              {filteredRows.map((row, idx) => {
                const isCritical = row.severity === 'CRITICAL';
                const isHigh = row.severity === 'HIGH';
                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-100 transition-colors font-bold"
                  >
                    <td className="py-3.5 px-4 text-sky-800 font-black">{row.time}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold">{row.source}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold">{row.destination}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-rose-600' : isHigh ? 'bg-amber-600' : 'bg-sky-600'}`} />
                      {row.attackType}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-800 font-black">{row.confidence}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : isHigh
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-sky-100 text-sky-900 border-sky-300'
                        }`}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-0.5 rounded text-[11px] font-black uppercase border ${
                          row.status === 'BLOCKED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : row.status === 'ISOLATED'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-sky-100 text-sky-900 border-sky-300'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
