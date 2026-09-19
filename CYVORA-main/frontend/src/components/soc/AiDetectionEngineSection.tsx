import React from 'react';
import { Cpu, ArrowRight, Layers, ShieldCheck, Zap, Database, Filter } from 'lucide-react';

export const AiDetectionEngineSection: React.FC = () => {
  const steps = [
    { title: 'NETWORK TRAFFIC', desc: 'Raw Packet Flow Stream', icon: Database, color: 'text-sky-600', border: 'border-sky-200' },
    { title: 'FEATURE EXTRACTION', desc: '83 Flow Attributes', icon: Filter, color: 'text-sky-600', border: 'border-sky-200' },
    { title: 'AI ENSEMBLE', desc: 'RF + Extra Trees Models', icon: Cpu, color: 'text-purple-600', border: 'border-purple-200' },
    { title: 'THREAT CLASSIFICATION', desc: '15 Attack Categories', icon: Layers, color: 'text-amber-600', border: 'border-amber-200' },
    { title: 'CONFIDENCE ANALYSIS', desc: 'Multi-Stage Gating', icon: ShieldCheck, color: 'text-emerald-600', border: 'border-emerald-200' },
    { title: 'SECURITY ALERT', desc: 'Autonomous Mitigation', icon: Zap, color: 'text-rose-600', border: 'border-rose-200' },
  ];

  const highlights = [
    {
      title: 'GLOBAL DETECTION ENGINE',
      subtitle: 'Random Forest + Extra Trees',
      description: 'Massive multi-class ensemble trained on enterprise network flows to catch volumetric and port scanning threats with 99.86% precision.',
      color: 'text-sky-700',
      border: 'border-sky-200',
      bg: 'bg-sky-50/50'
    },
    {
      title: 'WEB ATTACK SPECIALIST',
      subtitle: 'Specialized Web Threat Classification',
      description: 'Focused neural sub-classifier engineered specifically to detect subtle payload anomalies like SQL Injection, XSS, and HTTP Brute Force.',
      color: 'text-purple-700',
      border: 'border-purple-200',
      bg: 'bg-purple-50/50'
    },
    {
      title: 'CONFIDENCE-GATED DECISION',
      subtitle: 'Advanced Prediction Validation',
      description: 'Intelligent arbitration mechanism that overrides low-confidence global predictions when the web specialist exhibits high confidence (>95%).',
      color: 'text-emerald-700',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50'
    }
  ];

  return (
    <section className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono-code font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          <span>CYVORA ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight font-sans">
          ONE ENGINE.{' '}
          <span className="text-sky-700">
            MULTIPLE LAYERS OF DEFENSE.
          </span>
        </h2>
        <p className="text-slate-600 text-sm font-sans">
          End-to-end autonomous threat pipeline built for real-time telemetry processing and low-latency mitigation.
        </p>
      </div>

      {/* Visual Pipeline */}
      <div className="white-card p-6 border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative">
                <div className={`p-4 rounded-xl border ${step.border} bg-slate-50/80 text-center space-y-2 h-full flex flex-col justify-center items-center`}>
                  <div className={`p-2.5 rounded-lg bg-white border border-slate-200 ${step.color} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 font-mono-code leading-snug uppercase">
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono-code">
                    {step.desc}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((h, idx) => (
          <div
            key={idx}
            className={`white-card p-6 border ${h.border} ${h.bg} space-y-3 shadow-sm`}
          >
            <div className="space-y-1 font-mono-code">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${h.color}`}>
                {h.title}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {h.subtitle}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {h.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
