import React, { useState } from 'react';
import { RefreshCw, Send, Server } from 'lucide-react';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { getApiBaseUrl, setApiBaseUrl } from '../config/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { predictThreat } from '../services/predictionService';
import { getDefaultFeaturePayload } from '../config/features';

interface ApiLogItem {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST';
  endpoint: string;
  statusCode: number;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR';
}

export const ApiMonitor: React.FC = () => {
  const { isBackendConnected, responseTimeMs, healthData, modelInfo, apiStatus, isChecking, refetch } = useSystemHealth(3000);
  const [baseUrlInput, setBaseUrlInput] = useState<string>(getApiBaseUrl());
  const [requestCount, setRequestCount] = useState<number>(24);
  const [lastRequestTime, setLastRequestTime] = useState<string>(new Date().toLocaleTimeString());
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [logs, setLogs] = useState<ApiLogItem[]>([
    { id: '1', timestamp: new Date(Date.now() - 60000).toLocaleTimeString(), method: 'GET', endpoint: '/health', statusCode: 200, durationMs: 14, status: 'SUCCESS' },
    { id: '2', timestamp: new Date(Date.now() - 40000).toLocaleTimeString(), method: 'GET', endpoint: '/model-info', statusCode: 200, durationMs: 18, status: 'SUCCESS' },
    { id: '3', timestamp: new Date(Date.now() - 20000).toLocaleTimeString(), method: 'POST', endpoint: '/predict', statusCode: 200, durationMs: 42, status: 'SUCCESS' },
  ]);

  const handleSaveUrl = () => {
    setApiBaseUrl(baseUrlInput.trim());
    refetch();
  };

  const handleTestPredictionApi = async () => {
    setIsTesting(true);
    const start = performance.now();
    const ts = new Date().toLocaleTimeString();
    try {
      const payload = getDefaultFeaturePayload();
      await predictThreat(payload, false);
      const dur = Math.round(performance.now() - start);
      setRequestCount((c) => c + 1);
      setLastRequestTime(ts);
      setLogs((prev) => [
        { id: String(Date.now()), timestamp: ts, method: 'POST', endpoint: '/predict', statusCode: 200, durationMs: dur, status: 'SUCCESS' },
        ...prev.slice(0, 19),
      ]);
    } catch {
      const dur = Math.round(performance.now() - start);
      setRequestCount((c) => c + 1);
      setLastRequestTime(ts);
      setLogs((prev) => [
        { id: String(Date.now()), timestamp: ts, method: 'POST', endpoint: '/predict', statusCode: 500, durationMs: dur, status: 'ERROR' },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-white via-sky-50/30 to-white rounded-2xl border border-sky-100 shadow-3d">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            API GATEWAY
          </span>
          <span className="text-slate-400 text-xs font-medium">• FastAPI REST Integration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          API Monitor & Diagnostics
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
          Monitor endpoint latency, connection health, and test live inference calls.
        </p>
      </div>

      {/* 5 Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Backend</span>
          <span className="text-base font-extrabold text-sky-700 mt-1 block">FastAPI</span>
        </div>

        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Primary Endpoint</span>
          <span className="text-xs font-bold text-slate-800 mt-1 block truncate">
            POST /predict
          </span>
        </div>

        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Connection</span>
          <span className="mt-1 block">
            {isBackendConnected ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            ) : (
              <span className="text-rose-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Disconnected
              </span>
            )}
          </span>
        </div>

        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Response Time</span>
          <span className="text-base font-extrabold text-sky-700 mt-1 block">
            {isBackendConnected ? `${responseTimeMs} ms` : 'N/A'}
          </span>
        </div>

        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Total Calls</span>
          <span className="text-base font-extrabold text-slate-900 mt-1 block">{requestCount}</span>
        </div>

        <div className="stat-3d p-4">
          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Last Check</span>
          <span className="text-xs font-bold text-slate-800 mt-1 block">{lastRequestTime}</span>
        </div>
      </div>

      {/* API Configuration & Health Probe Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="FastAPI Connection Setup" subtitle="Configured via src/config/api.ts">
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5">FastAPI Base URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-sky-500 shadow-sm"
                  placeholder="http://127.0.0.1:8000"
                />
                <Button variant="primary" size="sm" onClick={handleSaveUrl}>
                  Update
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Default: <span className="text-sky-700 font-bold">http://127.0.0.1:8000</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={refetch}
                isLoading={isChecking}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Ping Health
              </Button>

              <Button
                variant="glow"
                size="sm"
                onClick={handleTestPredictionApi}
                isLoading={isTesting}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Test POST /predict
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Backend Response Inspector */}
        <Card title="Backend Service Status">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5 font-medium">
            <div className="flex justify-between text-slate-600">
              <span>Endpoint:</span>
              <span className="text-sky-700 font-bold">{getApiBaseUrl()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status:</span>
              <span className="text-emerald-700 font-bold">{healthData?.status || (isBackendConnected ? 'healthy' : 'offline')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Model Type:</span>
              <span className="text-slate-800 font-bold">{modelInfo?.model_type || 'Rare Attack Optimized RF V4'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Feature Schema:</span>
              <span className="text-purple-700 font-bold">{modelInfo?.feature_count ? `${modelInfo.feature_count} features` : '78 features'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Live API Activity Log */}
      <Card title="Recent API Requests">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-700 text-cyan-300 uppercase text-xs font-black bg-slate-900">
                <th className="py-3 px-4 text-cyan-300">Time</th>
                <th className="py-3 px-4 text-cyan-300">Method</th>
                <th className="py-3 px-4 text-cyan-300">Endpoint</th>
                <th className="py-3 px-4 text-cyan-300">Status Code</th>
                <th className="py-3 px-4 text-cyan-300">Latency</th>
                <th className="py-3 px-4 text-cyan-300">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[11px]">
                      {log.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-bold">{log.endpoint}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{log.statusCode}</td>
                  <td className="py-3 px-4 text-slate-600">{log.durationMs} ms</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
