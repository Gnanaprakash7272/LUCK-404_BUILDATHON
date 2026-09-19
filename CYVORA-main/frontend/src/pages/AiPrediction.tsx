import React, { useState } from 'react';
import { Cpu, AlertCircle } from 'lucide-react';
import { getDefaultFeaturePayload } from '../config/features';
import { FlowPreset } from '../data/sampleFlows';
import { FeatureInputGroup } from '../components/prediction/FeatureInputGroup';
import { PresetSelector } from '../components/prediction/PresetSelector';
import { PredictionResultCard } from '../components/prediction/PredictionResultCard';
import { ShapExplanationView } from '../components/prediction/ShapExplanationView';
import { predictThreat } from '../services/predictionService';
import { PredictionResult } from '../types/api';
import { useDemoMode } from '../hooks/useDemoMode';

export const AiPrediction: React.FC = () => {
  const { isDemoMode } = useDemoMode();
  const [features, setFeatures] = useState<Record<string, number>>(() => getDefaultFeaturePayload());
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isResultSimulated, setIsResultSimulated] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const handleFeatureChange = (key: string, value: number) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSelectedPresetId(undefined);
  };

  const handleSelectPreset = (preset: FlowPreset) => {
    setSelectedPresetId(preset.id);
    const updated = { ...getDefaultFeaturePayload(), ...preset.features };
    setFeatures(updated);
    setResult(null);
  };

  const handleReset = () => {
    setFeatures(getDefaultFeaturePayload());
    setSelectedPresetId(undefined);
    setResult(null);
    setApiErrorMessage(null);
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setApiErrorMessage(null);
    try {
      const response = await predictThreat(features, isDemoMode);
      setResult(response.result);
      setIsResultSimulated(response.isSimulated);
    } catch (err) {
      setApiErrorMessage(err instanceof Error ? err.message : 'Prediction request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header 3D Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-white via-sky-50/30 to-white rounded-2xl border border-sky-100 shadow-3d">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            AI INFERENCE STUDIO
          </span>
          <span className="text-slate-400 text-xs font-medium">• Flow Classification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Threat Prediction
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
          Test custom network flow parameters or select attack presets to run real-time inference.
        </p>
      </div>

      {/* Preset Vectors Selector */}
      <PresetSelector onSelectPreset={handleSelectPreset} selectedPresetId={selectedPresetId} />

      {/* Main Prediction Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feature Inputs Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-3d">
            <FeatureInputGroup
              features={features}
              onChange={handleFeatureChange}
              onReset={handleReset}
              onPredict={handlePredict}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Right Column: AI Result Card & SHAP View */}
        <div className="lg:col-span-5 space-y-6">
          {apiErrorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Inference Error:</span>
                <span>{apiErrorMessage}</span>
              </div>
            </div>
          )}

          {/* AI Result Card */}
          <PredictionResultCard result={result} isSimulated={isResultSimulated || isDemoMode} />

          {/* Explainable AI / SHAP View */}
          <ShapExplanationView
            shapData={null}
            predictionName={result ? result.prediction : undefined}
          />
        </div>
      </div>
    </div>
  );
};
