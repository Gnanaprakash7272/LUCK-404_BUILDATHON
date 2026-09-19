import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sliders, RefreshCw, Cpu } from 'lucide-react';
import { CORE_FEATURES, ADVANCED_FEATURES, FeatureDefinition } from '../../config/features';
import { Button } from '../common/Button';

interface Props {
  features: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onReset: () => void;
  onPredict: () => void;
  isLoading: boolean;
}

export const FeatureInputGroup: React.FC<Props> = ({
  features,
  onChange,
  onReset,
  onPredict,
  isLoading,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const renderField = (f: FeatureDefinition) => {
    const val = features[f.key] !== undefined ? features[f.key] : f.defaultValue;
    return (
      <div key={f.key} className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <label className="text-slate-900 font-extrabold truncate max-w-[190px]" title={f.label}>
            {f.label}
          </label>
          {f.unit && <span className="text-[10px] font-mono-code text-slate-700 font-bold">{f.unit}</span>}
        </div>
        <input
          type="number"
          step={f.step || 'any'}
          value={val}
          onChange={(e) => onChange(f.key, parseFloat(e.target.value) || 0)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-black font-mono-code focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors shadow-sm"
        />
        <p className="text-[11px] text-slate-700 font-semibold truncate" title={f.description}>
          {f.description}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 14 Core Network Flow Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-sky-900 font-mono-code flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-sky-700" />
            CORE NETWORK FLOW FEATURES (14 PRIMARY ATTRIBUTES)
          </h4>
          <span className="text-[11px] text-slate-700 font-mono-code font-bold">RFC Flow Telemetry Standard</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-300 shadow-sm">
          {CORE_FEATURES.map((f) => renderField(f))}
        </div>
      </div>

      {/* Expandable Advanced / Engineered Features */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 font-mono-code">
              ADVANCED ENGINEERED RATIOS & STATISTICAL FEATURES ({ADVANCED_FEATURES.length})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 font-mono-code font-semibold">
              CYVORA V4 Model Optimization
            </span>
          </div>
          <div className="text-slate-600 flex items-center gap-1 text-xs font-semibold">
            <span>{showAdvanced ? 'Hide Advanced' : 'Expand Advanced'}</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white animate-fadeIn">
            {ADVANCED_FEATURES.map((f) => renderField(f))}
          </div>
        )}
      </div>

      {/* Action Buttons: RESET & PREDICT */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onReset}
          icon={<RefreshCw className="w-4 h-4" />}
          disabled={isLoading}
        >
          RESET
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onPredict}
          isLoading={isLoading}
          icon={<Cpu className="w-4 h-4" />}
          className="min-w-[160px]"
        >
          PREDICT THREAT
        </Button>
      </div>
    </div>
  );
};
