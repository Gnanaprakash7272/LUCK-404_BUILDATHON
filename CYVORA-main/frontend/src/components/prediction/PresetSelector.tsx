import React from 'react';
import { Sparkles, ShieldCheck, Bug, Zap, Globe, Terminal } from 'lucide-react';
import { SAMPLE_FLOW_PRESETS, FlowPreset } from '../../data/sampleFlows';
import { Badge } from '../common/Badge';

interface Props {
  onSelectPreset: (preset: FlowPreset) => void;
  selectedPresetId?: string;
}

export const PresetSelector: React.FC<Props> = ({ onSelectPreset, selectedPresetId }) => {
  const getIcon = (id: string) => {
    if (id.includes('heartbleed')) return <Bug className="w-4 h-4 text-purple-600" />;
    if (id.includes('sql')) return <Terminal className="w-4 h-4 text-rose-600" />;
    if (id.includes('benign')) return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    if (id.includes('ddos')) return <Zap className="w-4 h-4 text-pink-600" />;
    return <Globe className="w-4 h-4 text-sky-600" />;
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800 uppercase tracking-wider font-mono-code flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          AUTHENTIC TEST VECTOR PRESETS
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Select to auto-populate exact flow features</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SAMPLE_FLOW_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              type="button"
              className={`p-3.5 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="p-1 rounded-lg bg-slate-100">{getIcon(preset.id)}</div>
                  <Badge variant="severity" severity={preset.expectedSeverity}>
                    {preset.expectedSeverity}
                  </Badge>
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{preset.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                  {preset.description}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono-code text-slate-500 font-semibold">
                <span>Expected:</span>
                <span className="text-sky-700 font-bold truncate max-w-[100px]">{preset.expectedClass}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
