import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, Activity } from 'lucide-react';

export const AlertCenterSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const alerts = [
    {
      id: 'ALT-9901',
      severity: 'CRITICAL',
      title: 'DDoS DETECTED',
      source: '192.168.1.31',
      target: '192.168.1.10',
      confidence: '99.2%',
      engine: 'Global Ensemble',
      status: 'ACTIVE',
      time: '14:32:11 UTC',
      desc: 'High volumetric SYN packet burst flooding target gateway on port 80.'
    },
    {
      id: 'ALT-9902',
      severity: 'HIGH',
      title: 'WEB ATTACK — SQL INJECTION',
      source: '192.168.1.42',
      target: '192.168.1.10',
      confidence: '99.14%',
      engine: 'Web Specialist',
      status: 'MITIGATED',
      time: '14:32:15 UTC',
      desc: 'Malicious payload UNION SELECT detected in HTTP GET parameters.'
    },
    {
      id: 'ALT-9903',
      severity: 'MEDIUM',
      title: 'RECONNAISSANCE PORT SCAN',
      source: '192.168.1.24',
      target: '192.168.1.10',
      confidence: '98.7%',
      engine: 'Global Ensemble',
      status: 'BLOCKED',
      time: '14:32:08 UTC',
      desc: 'Sequential TCP SYN probes across ports 1-1024.'
    },
    {
      id: 'ALT-9904',
      severity: 'LOW',
      title: 'SUSPICIOUS AGENT STRING',
      source: '10.0.0.88',
      target: '192.168.1.10',
      confidence: '91.4%',
      engine: 'Feature Rules Engine',
      status: 'MONITORING',
      time: '14:31:50 UTC',
      desc: 'Non-standard browser user-agent header detected on public route.'
    }
  ];

  const filtered = activeFilter === 'ALL'
    ? alerts
    : alerts.filter(a => a.severity === activeFilter);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          border: 'border-rose-200',
          bg: 'bg-rose-50/50',
          badge: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
          icon: AlertTriangle,
          iconColor: 'text-rose-600'
        };
      case 'HIGH':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/50',
          badge: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
          icon: ShieldAlert,
          iconColor: 'text-amber-600'
        };
      case 'MEDIUM':
        return {
          border: 'border-sky-200',
          bg: 'bg-sky-50/50',
          badge: 'bg-sky-50 text-sky-700 border-sky-200 font-bold',
          icon: Activity,
          iconColor: 'text-sky-600'
        };
      default:
        return {
          border: 'border-slate-200',
          bg: 'bg-slate-50',
          badge: 'bg-slate-100 text-slate-700 border-slate-200 font-bold',
          icon: Info,
          iconColor: 'text-slate-500'
        };
    }
  };

  return (
    <section className="space-y-6 font-mono-code">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wider flex items-center gap-2 uppercase">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>SECURITY ALERT CENTER</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AUTONOMOUS THREAT INCIDENT MANAGEMENT & DISPATCH CONSOLE
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">SEVERITY:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveFilter(sev)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] border transition-colors ${
                activeFilter === sev
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a) => {
          const style = getSeverityStyle(a.severity);
          const Icon = style.icon;
          return (
            <div
              key={a.id}
              className={`white-card p-5 border ${style.border} ${style.bg} shadow-sm space-y-3 relative overflow-hidden`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  <div>
                    <span className="text-[10px] text-slate-500 block">{a.id} • {a.time}</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase">{a.title}</h3>
                  </div>
                </div>

                <span className={`text-[10px] px-2.5 py-0.5 rounded border uppercase ${style.badge}`}>
                  {a.severity}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {a.desc}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">SOURCE IP:</span>
                  <span className="text-sky-700 font-bold">{a.source}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TARGET IP:</span>
                  <span className="text-slate-800 font-bold">{a.target}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CONFIDENCE:</span>
                  <span className="text-emerald-700 font-bold">{a.confidence}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">DETECTION ENGINE:</span>
                  <span className="text-purple-700 font-bold text-[11px]">{a.engine}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">STATUS:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold border ${
                    a.status === 'ACTIVE'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : a.status === 'MITIGATED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}
                >
                  {a.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
