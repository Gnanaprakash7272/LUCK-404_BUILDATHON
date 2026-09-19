import React from 'react';
import { Zap, Award } from 'lucide-react';
import { RARE_ATTACK_CLASSES } from '../data/attackClasses';
import { V4_RARE_ATTACK_PERFORMANCE } from '../data/modelEvolution';
import { Badge } from '../components/common/Badge';
import { formatPercent } from '../utils/formatters';

export const RareAttacks: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 3D Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-purple-50/60 via-white to-purple-50/30 rounded-2xl border border-purple-200 shadow-3d flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              CYVORA CORE FOCUS
            </span>
            <span className="text-slate-400 text-xs font-medium">• Class Imbalance Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rare Attack Intelligence
          </h1>
          <p className="text-sm text-slate-600 font-medium max-w-2xl">
            Specialized machine learning optimization for high-risk, low-frequency network attack signatures.
          </p>
        </div>
      </div>

      {/* 3 Optimization Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-3d p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold text-sm mb-3 shadow-sm">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Ratio Feature Engineering</h4>
            <p className="text-xs text-slate-500 font-medium">
              25+ engineered flow metrics isolating asymmetric payload transfer signatures.
            </p>
          </div>
        </div>

        <div className="stat-3d p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-sm mb-3 shadow-sm">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Cost-Sensitive Penalty</h4>
            <p className="text-xs text-slate-500 font-medium">
              Asymmetric loss weighting preventing models from ignoring critical rare classes.
            </p>
          </div>
        </div>

        <div className="stat-3d p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm mb-3 shadow-sm">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Calibrated Thresholds</h4>
            <p className="text-xs text-slate-500 font-medium">
              Optimized decision boundaries maximizing Macro F1 and precision.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Rare Attacks Spotlight Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            V4 Evaluated Rare Attack Targets
          </h3>
          <span className="text-xs text-slate-500 font-medium">Verified Holdout Benchmarks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {V4_RARE_ATTACK_PERFORMANCE.map((item) => {
            const info = RARE_ATTACK_CLASSES.find((c) => c.name === item.className);
            return (
              <div
                key={item.className}
                className="cyvora-glass p-5 flex flex-col justify-between group hover:border-purple-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <Badge variant="rare">RARE ATTACK</Badge>
                      <h4 className="font-bold text-base text-slate-900 mt-2">
                        {item.className}
                      </h4>
                      <span className="text-xs text-purple-700 font-semibold block">
                        MITRE {info?.mitreId || 'T1190'}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Performance Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Precision</span>
                      <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                        {formatPercent(item.precision)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Recall</span>
                      <span className="text-sm font-bold text-sky-700 mt-0.5 block">
                        {formatPercent(item.recall)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">F1 Score</span>
                      <span className="text-sm font-bold text-purple-700 mt-0.5 block">
                        {formatPercent(item.f1Score)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Support: {item.support} flows</span>
                    <span className="text-slate-700 font-bold">Port {info?.typicalPorts.join(', ')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
