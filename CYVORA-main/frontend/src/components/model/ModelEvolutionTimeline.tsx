import React from 'react';
import { GitCommit } from 'lucide-react';
import { MODEL_EVOLUTION_TIMELINE } from '../../data/modelEvolution';
import { Badge } from '../common/Badge';

export const ModelEvolutionTimeline: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-sky-600" />
          Model Evolution Roadmap
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Iterative ML optimization from baseline detection to rare-attack and feature engineering improvements.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-5 pl-6">
        {MODEL_EVOLUTION_TIMELINE.map((item) => {
          const isActive = item.status === 'ACTIVE';
          const isExperimental = item.status === 'EXPERIMENTAL';

          return (
            <div key={item.version} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-sm ${
                  isActive
                    ? 'bg-sky-600 border-sky-300'
                    : isExperimental
                    ? 'bg-purple-600 border-purple-300'
                    : 'bg-white border-slate-400'
                }`}
              >
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              {/* Version Card */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-50/70 to-white border-sky-300 shadow-3d'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                      {item.version}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px] font-semibold">{item.date}</span>
                    {isActive ? (
                      <Badge variant="online">PRODUCTION</Badge>
                    ) : isExperimental ? (
                      <Badge variant="rare">EXPERIMENTAL</Badge>
                    ) : (
                      <Badge variant="outline">ARCHIVED</Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">Algorithm: </span>
                  <span>{item.algorithm}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">{item.keyEnhancement}</p>

                {item.metrics && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold">
                    {item.metrics.accuracy !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Accuracy: {(item.metrics.accuracy * 100).toFixed(2)}%
                      </span>
                    )}
                    {item.metrics.macroF1 !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                        Macro F1: {(item.metrics.macroF1 * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
