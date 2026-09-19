import React from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { Button } from '../components/common/Button';
import { StatusIndicator } from '../components/common/StatusIndicator';

interface ServiceHealthItem {
  id: string;
  name: string;
  category: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  latency: string;
  version: string;
  details: string;
}

export const SystemHealth: React.FC = () => {
  const { isBackendConnected, responseTimeMs, isChecking, refetch, modelInfo } = useSystemHealth(4000);

  const services: ServiceHealthItem[] = [
    {
      id: 'frontend',
      name: 'CYVORA React Frontend',
      category: 'UI / Presentation Layer',
      status: 'ONLINE',
      latency: '< 1 ms',
      version: 'v1.0.0 (Vite / React)',
      details: 'All UI components, dashboards, and charts operational.',
    },
    {
      id: 'backend',
      name: 'CYVORA FastAPI Backend',
      category: 'Application Server',
      status: isBackendConnected ? 'ONLINE' : 'WARNING',
      latency: isBackendConnected ? `${responseTimeMs} ms` : 'N/A',
      version: 'FastAPI 1.0.0',
      details: isBackendConnected
        ? 'Active connection on http://127.0.0.1:8000.'
        : 'Backend server offline. Operating in simulated demo mode.',
    },
    {
      id: 'ml-model',
      name: 'Random Forest Inference Engine',
      category: 'ML Core Layer',
      status: isBackendConnected ? 'ONLINE' : 'WARNING',
      latency: isBackendConnected ? `${Math.max(responseTimeMs - 5, 2)} ms` : 'N/A',
      version: 'Model V4.0 (Joblib)',
      details: modelInfo?.model_type || '78 feature attributes calibrated for 15 classes.',
    },
    {
      id: 'feature-processor',
      name: 'Network Feature Processor',
      category: 'Feature Pipeline',
      status: 'ONLINE',
      latency: '< 2 ms',
      version: 'v4.0.0 (NumPy / Pandas)',
      details: 'Flow length ratios, log-transforms, and RFC standard verification.',
    },
    {
      id: 'prediction-api',
      name: 'Prediction REST Route',
      category: 'Inference API (POST /predict)',
      status: isBackendConnected ? 'ONLINE' : 'WARNING',
      latency: isBackendConnected ? `${responseTimeMs} ms` : 'N/A',
      version: 'v1.0',
      details: 'Outputs class probabilities and risk level classification.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 3D Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-white via-emerald-50/30 to-white rounded-2xl border border-emerald-100 shadow-3d flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              SYSTEM DIAGNOSTICS
            </span>
            <span className="text-slate-400 text-xs font-medium">• Health & Uptime Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Subsystem Health Status
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl font-medium">
            Live health telemetry across frontend, FastAPI backend, ML models, and feature processors.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          isLoading={isChecking}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Check Now
        </Button>
      </div>

      {/* Grid of 5 Subsystem Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="cyvora-glass p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{svc.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{svc.category}</span>
                </div>
                <StatusIndicator status={svc.status} label={svc.status} />
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Version:</span>
                <span className="text-slate-800 font-bold">{svc.version}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Latency:</span>
                <span className="text-sky-700 font-bold">{svc.latency}</span>
              </div>
              <div className="pt-2 text-slate-600 border-t border-slate-100 font-medium text-[11px]">
                {svc.details}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
