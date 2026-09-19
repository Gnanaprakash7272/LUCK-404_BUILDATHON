import React from 'react';
import { ModelEvolutionTimeline } from '../components/model/ModelEvolutionTimeline';
import { MetricCardGrid } from '../components/model/MetricCardGrid';
import { FeatureImportanceChart } from '../components/charts/FeatureImportanceChart';
import { Card } from '../components/common/Card';

export const ModelIntelligence: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 3D Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-white via-sky-50/30 to-white rounded-2xl border border-sky-100 shadow-3d">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
            MODEL ARCHITECTURE
          </span>
          <span className="text-slate-400 text-xs font-medium">• ML Pipeline Evolution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Intelligence & Performance
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
          Verified evaluation benchmarks, feature attribution rankings, and the progressive V1–V21 model evolution milestones.
        </p>
      </div>

      {/* Model Overview Summary Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Current Model</span>
          <span className="text-sm font-bold text-sky-700 mt-1 block">CYVORA V4</span>
        </div>
        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Algorithm</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block truncate" title="Cost-Sensitive Random Forest">
            Cost-Sensitive RF
          </span>
        </div>
        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Model Version</span>
          <span className="text-sm font-bold text-purple-700 mt-1 block">Release 4.0</span>
        </div>
        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Total Features</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block">78 Features</span>
        </div>
        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Eval Classes</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block">15 Classes</span>
        </div>
        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Status</span>
          <span className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
      </div>

      {/* Verified Performance Metrics Grid */}
      <MetricCardGrid />

      {/* Evolution Timeline & Feature Importance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card>
            <ModelEvolutionTimeline />
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Feature Attribution Profile"
            subtitle="Top mathematical features driving tree splits"
          >
            <FeatureImportanceChart limit={10} />
          </Card>
        </div>
      </div>
    </div>
  );
};
