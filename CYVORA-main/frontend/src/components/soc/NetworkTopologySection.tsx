import React, { useState } from 'react';
import { Network, ShieldAlert, Zap, Server, Laptop, Activity, AlertOctagon } from 'lucide-react';

export const NetworkTopologySection: React.FC = () => {
  const [threatDetected, setThreatDetected] = useState<boolean>(true);

  return (
    <section className="space-y-6 font-mono-code">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wider flex items-center gap-2 uppercase">
            <Network className="w-5 h-5 text-sky-600" />
            <span>LIVE NETWORK TOPOLOGY VISUALIZATION</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AUTONOMOUS INFRASTRUCTURE SENSOR MAP & ATTACK PATH TRACING
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setThreatDetected(!threatDetected)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
              threatDetected
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {threatDetected ? 'SIMULATED THREAT (ACTIVE)' : 'SIMULATE THREAT INJECTION'}
          </button>
        </div>
      </div>

      {/* Topology Canvas Display */}
      <div className="white-card rounded-xl p-6 border border-slate-200 bg-white shadow-sm relative overflow-hidden">
        {/* Topology Map Header HUD */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              TOPOLOGY REGION: EAST-SOC-CLUSTER
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">NODES ONLINE: 14</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-sky-800 font-bold">
              AI SENSOR V21.1 INLINE
            </span>
          </div>
        </div>

        {/* Network Diagram Grid */}
        <div className="relative min-h-[360px] my-4 rounded-xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between overflow-hidden">
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Base connections */}
            <line x1="15%" y1="30%" x2="50%" y2="50%" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="15%" y1="70%" x2="50%" y2="50%" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="85%" y2="30%" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="85%" y2="70%" stroke="#CBD5E1" strokeWidth="2" />

            {/* Active Threat Path Highlight */}
            {threatDetected && (
              <>
                <line
                  x1="15%"
                  y1="85%"
                  x2="50%"
                  y2="50%"
                  stroke="#DC2626"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="85%"
                  y2="30%"
                  stroke="#DC2626"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
              </>
            )}
          </svg>

          {/* Node Placement Layer */}
          <div className="relative z-10 grid grid-cols-3 h-full items-center text-center">
            {/* Column 1: Clients & Threat Node */}
            <div className="space-y-12">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 inline-block shadow-sm">
                <Laptop className="w-6 h-6 text-sky-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-900 block">CLIENT CLUSTER</span>
                <span className="text-[9px] text-slate-500">192.168.1.0/24</span>
              </div>

              {/* Threat Node */}
              <div className={`p-3.5 rounded-xl border inline-block shadow-sm ${
                threatDetected
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}>
                <Zap className={`w-6 h-6 mx-auto mb-1 ${threatDetected ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-[11px] font-bold text-slate-900 block">
                  {threatDetected ? 'THREAT NODE (MALICIOUS)' : 'EXTERNAL PROBE'}
                </span>
                <span className="text-[9px] text-rose-700 font-bold">192.168.1.31</span>
              </div>
            </div>

            {/* Column 2: AI Sensor Node (Center Hub) */}
            <div className="my-auto">
              <div className="p-5 rounded-2xl bg-sky-50 border-2 border-sky-300 inline-block shadow-sm relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-sky-600 text-white text-[9px] font-bold uppercase">
                  AI SENSOR V21.1
                </span>
                <Activity className="w-8 h-8 text-sky-700 mx-auto my-1" />
                <span className="text-xs font-bold text-slate-900 block">INLINE TELEMETRY SENSOR</span>
                <span className="text-[10px] text-sky-700 font-bold">INSPECTION RATE: 100%</span>
              </div>
            </div>

            {/* Column 3: Protected Servers */}
            <div className="space-y-12">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 inline-block shadow-sm">
                <Server className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-900 block">CORE API SERVER</span>
                <span className="text-[9px] text-slate-500">192.168.1.10</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 inline-block shadow-sm">
                <Server className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-900 block">DATABASE CLUSTER</span>
                <span className="text-[9px] text-slate-500">192.168.1.15</span>
              </div>
            </div>
          </div>

          {/* Active Threat Callout Overlay */}
          {threatDetected && (
            <div className="absolute top-4 right-4 max-w-sm p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5 shadow-md z-30 font-mono-code">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>ATTACK VECTOR INTERCEPTED</span>
              </div>
              <p className="text-slate-700 text-[11px]">
                High-volume DDoS flood origin: <span className="text-slate-900 font-bold">192.168.1.31</span> targeting <span className="text-slate-900 font-bold">192.168.1.10</span>.
              </p>
              <div className="flex justify-between items-center text-[10px] pt-1 text-slate-500 border-t border-rose-200">
                <span>CONFIDENCE: <strong className="text-emerald-700">99.2%</strong></span>
                <span>STATUS: <strong className="text-rose-700">MITIGATED</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
