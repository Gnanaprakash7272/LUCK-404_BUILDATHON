import React from 'react';
import { Network, Cpu, Database, Server, ChevronRight, ShieldCheck, LayoutDashboard, Sliders } from 'lucide-react';

export const SecurityArchitectureDiagram: React.FC = () => {
  const steps = [
    { name: 'NETWORK', desc: 'Enterprise Traffic', icon: Network, color: 'text-sky-600', border: 'border-sky-200' },
    { name: 'TRAFFIC SENSOR', desc: 'Inline Packet Collector', icon: Database, color: 'text-sky-600', border: 'border-sky-200' },
    { name: 'FLOW FEATURES', desc: '83 Metric Extractor', icon: Sliders, color: 'text-purple-600', border: 'border-purple-200' },
    { name: 'CYVORA API', desc: 'FastAPI Gateway', icon: Server, color: 'text-emerald-600', border: 'border-emerald-200' },
    { name: 'V21.1 AI ENGINE', desc: 'Multi-Stage Ensemble', icon: Cpu, color: 'text-amber-600', border: 'border-amber-200' },
    { name: 'THREAT CLASSIFICATION', desc: '15 Attack Vector Match', icon: ShieldCheck, color: 'text-rose-600', border: 'border-rose-200' },
    { name: 'SOC DASHBOARD', desc: 'Real-Time Console', icon: LayoutDashboard, color: 'text-sky-600', border: 'border-sky-200' }
  ];

  return (
    <section className="space-y-6 font-mono-code">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wider uppercase flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <span>SECURITY ARCHITECTURE</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            HIGH-THROUGHPUT DATAFLOW PIPELINE FROM SENSOR TO ANALYST DASHBOARD
          </p>
        </div>
      </div>

      <div className="white-card rounded-xl p-6 border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[900px] gap-2 py-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={idx}>
                <div className={`p-4 rounded-xl border ${s.border} bg-slate-50/80 text-center space-y-2 flex-1 shadow-sm`}>
                  <div className={`p-2.5 rounded-lg bg-white border border-slate-200 ${s.color} inline-block shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug uppercase">
                    {s.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 block font-normal">
                    {s.desc}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
