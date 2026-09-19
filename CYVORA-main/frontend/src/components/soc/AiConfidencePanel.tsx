import React from 'react';
import { Cpu, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export const AiConfidencePanel: React.FC = () => {
  const confidence = 99.14;
  const strokeDashoffset = 440 - (440 * confidence) / 100;

  return (
    <section className="space-y-6 font-mono-code">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wider flex items-center gap-2 uppercase">
            <Cpu className="w-5 h-5 text-sky-600" />
            <span>AI CONFIDENCE VISUALIZATION</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            MULTI-STAGE PREDICTION VALIDATION & CONFIDENCE-GATED ARBITRATION
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800 font-bold uppercase">
            SPECIALIST OVERRIDE ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Circular Gauge Panel */}
        <div className="lg:col-span-5 white-card rounded-xl p-6 border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center text-center space-y-4 relative">
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase">
            THREAT DETECTED
          </div>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pt-2">
            WEB ATTACK — SQL INJECTION
          </h3>

          {/* SVG Circular Dial */}
          <div className="relative w-48 h-48 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="text-slate-100"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className="text-sky-600"
                strokeWidth="12"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                99.14%
              </span>
              <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider">
                CONFIDENCE SCORE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full text-xs pt-2 border-t border-slate-100">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">THREAT SCORE</span>
              <span className="text-rose-700 font-bold">HIGH</span>
            </div>
            <div className="p-2 rounded bg-purple-50 border border-purple-200">
              <span className="text-[10px] text-purple-700 block uppercase">MODEL DECISION</span>
              <span className="text-purple-800 font-bold text-[11px]">SPECIALIST OVERRIDE</span>
            </div>
          </div>
        </div>

        {/* Right Multi-Stage Pipeline Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="white-card rounded-xl p-5 border border-slate-200 bg-white shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 uppercase">STAGE 1: GLOBAL DETECTION ENGINE</span>
              <span className="text-slate-500">Random Forest + Extra Trees</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-700">Global Prediction:</span>
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                BENIGN
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Global Confidence:</span>
              <span className="text-amber-700 font-bold">68.2% (Low Confidence)</span>
            </div>
          </div>

          <div className="white-card rounded-xl p-5 border border-purple-200 bg-purple-50/30 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs text-purple-800 border-b border-purple-100 pb-2">
              <span className="font-bold text-slate-900 uppercase">STAGE 2: WEB ATTACK SPECIALIST</span>
              <span className="text-purple-800 font-bold">Web Threat Sub-Classifier</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-700">Web Specialist Prediction:</span>
              <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                SQL INJECTION
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Specialist Confidence:</span>
              <span className="text-sky-700 font-bold">99.14% (High Certainty)</span>
            </div>
          </div>

          <div className="white-card rounded-xl p-5 border border-sky-300 bg-sky-50/50 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-sky-900 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                STAGE 3: FINAL ARBITRATED DECISION
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                CONFIDENCE-GATED
              </span>
            </div>
            <div className="flex justify-between items-center text-base pt-1">
              <span className="text-slate-900 font-bold">Final Threat Decision:</span>
              <span className="text-rose-700 font-black text-lg bg-rose-50 px-3 py-1 rounded border border-rose-200">
                SQL INJECTION
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
