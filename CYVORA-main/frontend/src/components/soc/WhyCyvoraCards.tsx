import React from 'react';
import { Zap, Layers, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const WhyCyvoraCards: React.FC = () => {
  const cards = [
    {
      title: 'REAL-TIME DETECTION',
      description: 'Analyze network activity and identify threats quickly with microsecond latency flow processing.',
      icon: Zap,
      color: 'text-sky-600',
      border: 'border-sky-200',
      bg: 'bg-sky-50/50'
    },
    {
      title: 'AI ENSEMBLE',
      description: 'Combine multiple machine-learning models including Random Forest and Extra Trees for robust multi-class classification.',
      icon: Layers,
      color: 'text-purple-600',
      border: 'border-purple-200',
      bg: 'bg-purple-50/50'
    },
    {
      title: 'SPECIALIZED WEB SECURITY',
      description: 'Dedicated intelligence for web attack detection, specifically tuned for SQL Injection, XSS, and HTTP Brute Force.',
      icon: Globe,
      color: 'text-amber-600',
      border: 'border-amber-200',
      bg: 'bg-amber-50/50'
    },
    {
      title: 'CONFIDENCE-AWARE AI',
      description: 'Use prediction confidence to improve final threat decisions and eliminate false positives via gated arbitration.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50'
    }
  ];

  return (
    <section className="space-y-6 font-sans">
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono-code font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          <span>CYVORA ADVANTAGE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
          ENTERPRISE CAPABILITIES ENGINEERED FOR SOC TEAM EXCELLENCE
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className={`white-card p-6 border ${c.border} ${c.bg} shadow-sm space-y-3 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className={`p-3 rounded-lg bg-white border border-slate-200 ${c.color} inline-block shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-mono-code uppercase tracking-wider">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
