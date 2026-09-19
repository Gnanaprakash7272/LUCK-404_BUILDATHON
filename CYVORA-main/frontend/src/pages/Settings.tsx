import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getApiBaseUrl, setApiBaseUrl } from '../config/api';
import { useDemoMode } from '../hooks/useDemoMode';

export const Settings: React.FC = () => {
  const { isDemoMode, setDemoMode } = useDemoMode();
  const [apiUrl, setApiUrl] = useState<string>(getApiBaseUrl());
  const [pollInterval, setPollInterval] = useState<string>('3000');
  const [autoRefreshFeed, setAutoRefreshFeed] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setApiBaseUrl(apiUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 3D Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-white via-slate-50/50 to-white rounded-2xl border border-slate-200 shadow-3d">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            PREFERENCES
          </span>
          <span className="text-slate-400 text-xs font-medium">• Platform Controls</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          Configure API connection parameters, polling intervals, and simulation modes.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {/* Settings Cards */}
      <div className="space-y-4">
        <Card title="FastAPI Backend Connection" subtitle="Endpoint Server Setup">
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">FastAPI Base URL:</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-sky-500 shadow-sm"
                placeholder="http://127.0.0.1:8000"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                Default: <span className="text-sky-700 font-bold">http://127.0.0.1:8000</span>
              </p>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5">Health Polling Rate:</label>
              <select
                value={pollInterval}
                onChange={(e) => setPollInterval(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-sky-500 shadow-sm"
              >
                <option value="2000">2 Seconds (High Frequency)</option>
                <option value="3000">3 Seconds (Standard)</option>
                <option value="5000">5 Seconds</option>
                <option value="10000">10 Seconds</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="Operating Mode" subtitle="Expo Simulation vs Live Backend Mode">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block text-sm">Expo Demo Simulation</span>
                <span className="text-slate-500 text-[11px] font-medium">
                  Generates realistic streaming telemetry when backend is offline.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block text-sm">Auto-Refresh Live Feed</span>
                <span className="text-slate-500 text-[11px] font-medium">
                  Automatically refresh incoming packet flows.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoRefreshFeed}
                onChange={(e) => setAutoRefreshFeed(e.target.checked)}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" size="md" onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
