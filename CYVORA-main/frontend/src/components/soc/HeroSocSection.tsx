import React from 'react';
import { Shield, Radio, ChevronRight, Zap, Terminal, Lock, Activity, CheckCircle2, Server } from 'lucide-react';

interface Props {
  onExploreEngine?: () => void;
  onLaunchDashboard?: () => void;
}

export const HeroSocSection: React.FC<Props> = ({ onExploreEngine, onLaunchDashboard }) => {
  return (
    <section className="white-card p-6 lg:p-8 shadow-sm relative overflow-hidden bg-white border border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Copy Column */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono-code font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>AI AUTONOMOUS THREAT ENGINE V21.1</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight uppercase leading-[1.15] font-sans">
            AI THAT SEES THE ATTACK{' '}
            <span className="text-sky-700">
              BEFORE IT BECOMES A THREAT.
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
            CYVORA is an AI-powered cyber threat detection platform designed to identify network attacks, classify threats, measure confidence, and deliver real-time security intelligence.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1 font-mono-code text-xs">
            <button
              onClick={onLaunchDashboard}
              className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>LAUNCH CYVORA</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreEngine}
              className="px-6 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-slate-600" />
              <span>EXPLORE DETECTION ENGINE</span>
            </button>
          </div>

          {/* Telemetry Status Bar */}
          <div className="pt-2 flex items-center gap-4 text-xs font-mono-code text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-800 font-bold">TELEMETRY STREAM:</span>
            </div>
            <span className="text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 font-bold">
              12.8K FLOWS/SEC
            </span>
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
              0.42ms LATENCY
            </span>
          </div>
        </div>

        {/* Right Static Telemetry Overview Panel */}
        <div className="lg:col-span-5">
          <div className="white-card p-5 bg-slate-50/50 border border-slate-200 space-y-4 font-mono-code text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>REAL-TIME SOC TELEMETRY</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                AUTONOMOUS ACTIVE
              </span>
            </div>

            {/* Static Telemetry Breakdown Cards */}
            <div className="space-y-2.5">
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-medium">INSPECTION MODEL:</span>
                <span className="font-bold text-slate-900">ENSEMBLE_RF_V21.1</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-medium">ACCURACY BENCHMARK:</span>
                <span className="font-bold text-emerald-700">99.86% TEST ACC</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-medium">PRIMARY CLASSIFICATION:</span>
                <span className="font-bold text-sky-700">15 ATTACK CLASSES</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-medium">WEB SPECIALIST ENGINE:</span>
                <span className="font-bold text-purple-700">CONFIDENCE-GATED</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-sky-50 border border-sky-200 text-[11px] text-sky-800 flex justify-between items-center font-bold">
              <span>ACTIVE SECURITY POLICY:</span>
              <span>STRICT AUTO-MITIGATION</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
