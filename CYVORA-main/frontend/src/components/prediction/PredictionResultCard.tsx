import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Sliders, ShieldX, Activity, Zap } from 'lucide-react';
import { PredictionResult } from '../../types/api';
import { formatPercent } from '../../utils/formatters';
import { getAttackInfo } from '../../data/attackClasses';

interface Props {
  result: PredictionResult | null;
  isSimulated?: boolean;
}

export const PredictionResultCard: React.FC<Props> = ({ result, isSimulated = false }) => {
  if (!result) {
    return (
      <div className="cyber-glass rounded-xl p-8 border border-cyan-500/30 bg-[#070D1D]/90 shadow-2xl text-center flex flex-col items-center justify-center min-h-[300px] font-mono-code">
        <div className="p-4 rounded-2xl bg-cyan-950 text-cyan-400 mb-3 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Cpu className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-white uppercase tracking-wider">Inference Ready</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1 font-sans">
          Choose a preset above or input flow values, then click <strong className="text-cyan-400">PREDICT THREAT</strong>.
        </p>
      </div>
    );
  }

  const isAttack = result.is_attack;
  const attackInfo = getAttackInfo(result.prediction);

  const responseAction = result.response_action || (isAttack ? 'BLOCK' : 'ALLOW');
  const preventionAction = result.prevention_action || (isAttack ? 'BLOCK' : 'ALLOW');
  const preventionStatus = result.prevention_status || (isAttack ? 'ATTACK_BLOCKED' : 'TRAFFIC_ALLOWED');
  const isEnforced = result.enforced ?? true;

  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'BLOCK':
        return 'bg-rose-950 text-rose-300 border-rose-500/50';
      case 'RATE_LIMIT':
        return 'bg-amber-950 text-amber-300 border-amber-500/50';
      case 'ALERT':
        return 'bg-purple-950 text-purple-300 border-purple-500/50';
      case 'ALLOW':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div
      className={`cyber-glass rounded-xl border transition-all duration-300 overflow-hidden shadow-2xl font-mono-code ${
        isAttack
          ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/30 via-[#070D1D] to-[#040814]'
          : 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 via-[#070D1D] to-[#040814]'
      }`}
    >
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#050A14] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <Cpu className="w-3.5 h-3.5" />
          </span>
          <span>Threat Analysis Result</span>
        </div>

        <div className="flex items-center gap-2">
          {isSimulated && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
              Simulated
            </span>
          )}
          <span className="text-xs text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 font-bold">
            {result.model_version || 'V21.1'} Engine
          </span>
        </div>
      </div>

      {/* Main Result Content */}
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Main Verdict */}
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-2xl border flex-shrink-0 shadow-lg ${
                isAttack
                  ? 'bg-rose-950 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-emerald-950 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isAttack ? <ShieldAlert className="w-9 h-9" /> : <ShieldCheck className="w-9 h-9" />}
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block mb-0.5">
                Prediction Verdict
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {result.prediction}
              </h3>
              <p className="text-xs text-slate-200 mt-1 font-sans leading-snug font-bold">
                Attack Type: <strong className="text-cyan-300 font-mono-code font-black">{result.attack_type || result.prediction}</strong> ({attackInfo.category})
              </p>
            </div>
          </div>

          {/* Key Attribute Badges */}
          <div className="flex flex-wrap sm:flex-col items-end gap-2 text-xs font-bold">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-200 font-bold">Status:</span>
              <span className={isAttack ? 'text-rose-400 font-black' : 'text-emerald-400 font-black'}>
                {isAttack ? 'THREAT DETECTED' : 'SAFE / VERIFIED'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-200 font-bold">Severity:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${
                  result.severity === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                    : result.severity === 'HIGH'
                    ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                    : 'bg-sky-950 text-sky-300 border-sky-500/50'
                }`}
              >
                {result.severity}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-200 uppercase tracking-wider font-extrabold">
              Confidence Score
            </span>
            <span className="text-base text-cyan-300 font-black">
              {formatPercent(result.confidence)}
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAttack
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              }`}
              style={{ width: `${(result.confidence || 0.99) * 100}%` }}
            />
          </div>
        </div>

        {/* Prevention & Response Execution Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-cyan-300 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>PREVENTION & ENFORCEMENT BREAKDOWN</span>
            </span>
            <span className="text-[11px] text-slate-300 font-extrabold">CYVORA V21.1 SOC</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-cyan-300 uppercase font-black block mb-1">
                Response Action
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-black border inline-block uppercase ${getActionBadgeColor(responseAction)}`}>
                {responseAction}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-cyan-300 uppercase font-black block mb-1">
                Prevention Action
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-black border inline-block uppercase ${getActionBadgeColor(preventionAction)}`}>
                {preventionAction}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-cyan-300 uppercase font-black block mb-1">
                Prevention Status
              </span>
              <span className="text-xs font-black text-white uppercase block tracking-tight">
                {preventionStatus}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-cyan-300 uppercase font-black block mb-1">
                Enforced
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border inline-block ${isEnforced ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-slate-800 text-slate-300'}`}>
                {isEnforced ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Flow Banner */}
        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-center font-mono-code text-[11px]">
          <div className="text-slate-400 font-bold uppercase tracking-wider mb-1">
            DETECTION PIPELINE FLOW
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-white font-extrabold">
            <span className="text-slate-300">DETECTION</span>
            <span className="text-cyan-400">→</span>
            <span className="text-cyan-300">AI PREDICTION</span>
            <span className="text-cyan-400">→</span>
            <span className="text-purple-300">CONFIDENCE CHECK</span>
            <span className="text-cyan-400">→</span>
            <span className="text-amber-300">RESPONSE ENGINE</span>
            <span className="text-cyan-400">→</span>
            <span className="text-sky-300">PREVENTION LAYER</span>
            <span className="text-cyan-400">→</span>
            <span className={`px-2 py-0.5 rounded text-[11px] border uppercase ${getActionBadgeColor(preventionAction)}`}>
              {preventionAction}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
