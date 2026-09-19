import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Radio,
  Lock,
  ArrowRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { fetchPreventionStatus, PreventionCheckResult } from '../../services/preventionService';
import { PreventionStatusData } from '../../types/api';

interface PreventionLayerSectionProps {
  onStatusUpdated?: (data: PreventionStatusData | null) => void;
  lastPredictionAction?: {
    action: string;
    status: string;
    enforced: boolean;
    timestamp: string;
  } | null;
}

export const PreventionLayerSection: React.FC<PreventionLayerSectionProps> = ({
  onStatusUpdated,
  lastPredictionAction,
}) => {
  const [preventionState, setPreventionState] = useState<PreventionCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchPreventionStatus();
    setPreventionState(result);
    setIsLoading(false);
    if (onStatusUpdated) {
      onStatusUpdated(result.data);
    }
  }, [onStatusUpdated]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Periodic polling every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadStatus]);

  const isConnected = preventionState?.isConnected ?? false;
  const data = preventionState?.data;

  // Determine Engine status display
  const engineStatusStr = isConnected
    ? (data?.status ? data.status.toUpperCase() : 'ACTIVE')
    : 'INACTIVE';
  
  const isEngineActive = isConnected && engineStatusStr === 'ACTIVE';

  // Current action & status (from last prediction or backend defaults)
  const currentAction = lastPredictionAction?.action || data?.current_action || 'ALLOW';
  const currentStatus = lastPredictionAction?.status || data?.current_status || 'TRAFFIC_ALLOWED';
  const isEnforced = lastPredictionAction?.enforced ?? data?.enforced ?? true;

  // Visual helper styles for prevention action
  const getActionBadgeStyle = (action: string) => {
    switch (action.toUpperCase()) {
      case 'BLOCK':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          darkBg: 'bg-rose-950/60 text-rose-300 border-rose-500/50',
          dot: 'bg-rose-600',
          icon: ShieldX,
        };
      case 'RATE_LIMIT':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          darkBg: 'bg-amber-950/60 text-amber-300 border-amber-500/50',
          dot: 'bg-amber-600',
          icon: Sliders,
        };
      case 'ALERT':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
          darkBg: 'bg-purple-950/60 text-purple-300 border-purple-500/50',
          dot: 'bg-purple-600',
          icon: ShieldAlert,
        };
      case 'ALLOW':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          darkBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50',
          dot: 'bg-emerald-600',
          icon: ShieldCheck,
        };
    }
  };

  const currentActionStyle = getActionBadgeStyle(currentAction);

  return (
    <section className="space-y-6 font-sans">
      {/* Top Section Header & Status Banner */}
      <div className="white-card p-6 border border-slate-200 bg-white rounded-2xl shadow-3d space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-600" />
                AI PREVENTION LAYER
              </span>
              <span className="text-xs text-slate-400 font-mono-code font-semibold hidden sm:inline">
                • REAL-TIME THREAT PREVENTION
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 font-mono-code">
              AUTOMATED RESPONSE & ENFORCEMENT ENGINE
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Backend Connection Indicator */}
            {isConnected ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono-code font-bold flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>PREVENTION ENGINE: {engineStatusStr}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono-code font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>Backend Disconnected</span>
              </div>
            )}

            {/* Manual Refresh button */}
            <button
              onClick={loadStatus}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-mono-code text-xs font-bold transition flex items-center gap-1.5"
              title="Refresh Prevention Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REFRESH</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono-code">
          <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>REAL-TIME ENFORCEMENT PIPELINE FLOW</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">STEP 1</span>
              <span className="font-extrabold text-slate-200">DETECTION</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">STEP 2</span>
              <span className="font-extrabold text-cyan-300">AI PREDICTION</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">STEP 3</span>
              <span className="font-extrabold text-purple-300">CONFIDENCE</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">STEP 4</span>
              <span className="font-extrabold text-amber-300">RESPONSE</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">STEP 5</span>
              <span className="font-extrabold text-sky-300">PREVENTION</span>
            </div>

            <div className={`p-2.5 rounded-lg border space-y-1 font-bold ${currentActionStyle.darkBg}`}>
              <span className="text-[10px] opacity-80 font-bold block">DECISION</span>
              <span className="font-black text-sm tracking-wider uppercase">
                {currentAction}
              </span>
            </div>
          </div>
        </div>

        {/* 8 Mandatory Prevention Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-code">
          {/* 1. Prevention Engine Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>PREVENTION ENGINE STATUS</span>
              <Radio className={`w-4 h-4 ${isEngineActive ? 'text-emerald-600' : 'text-slate-500'}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isEngineActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className={`text-xl font-black ${isEngineActive ? 'text-emerald-800' : 'text-rose-800'}`}>
                {engineStatusStr}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 font-bold">
              API-Level Autonomous Enforcement
            </p>
          </div>

          {/* 2. Current Prevention Action */}
          <div className={`p-4 rounded-xl border ${currentActionStyle.bg} shadow-sm space-y-2`}>
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>CURRENT ACTION</span>
              <currentActionStyle.icon className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentActionStyle.dot}`} />
              <span className="text-xl font-black tracking-tight uppercase">
                {currentAction}
              </span>
            </div>
            <p className="text-[11px] text-slate-800 font-bold">
              ALLOWED / ALERT / RATE_LIMIT / BLOCK
            </p>
          </div>

          {/* 3. Prevention Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>PREVENTION STATUS</span>
              <Activity className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight uppercase truncate" title={currentStatus}>
              {currentStatus}
            </div>
            <p className="text-[11px] text-slate-700 font-bold">
              Real-time threat status verdict
            </p>
          </div>

          {/* 4. Enforcement Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>ENFORCEMENT STATUS</span>
              <Lock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${isEnforced ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-200 text-slate-900'}`}>
                ENFORCED: {isEnforced ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 font-bold">
              Active inline mitigation policy
            </p>
          </div>

          {/* 5. Blocked Sources Count */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>BLOCKED SOURCES COUNT</span>
              <ShieldX className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-900">
              {data ? data.blocked_sources : (isConnected ? 0 : '-')}
            </div>
            <p className="text-[11px] text-rose-800 font-bold">
              Active IP/Source blocks in backend memory
            </p>
          </div>

          {/* 6. Rate-Limited Sources Count */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>RATE-LIMITED SOURCES COUNT</span>
              <Sliders className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900">
              {data ? data.rate_limited_sources : (isConnected ? 0 : '-')}
            </div>
            <p className="text-[11px] text-amber-800 font-bold">
              Throttled high-frequency sources
            </p>
          </div>

          {/* 7. Block Duration */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>BLOCK DURATION</span>
              <Lock className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {data?.block_duration_seconds ? `${data.block_duration_seconds}s` : '300s'}
            </div>
            <p className="text-[11px] text-slate-700 font-bold">
              Backend configured block TTL
            </p>
          </div>

          {/* 8. Rate Limit Duration */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-900 font-black">
              <span>RATE LIMIT DURATION</span>
              <Sliders className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {data?.rate_limit_duration_seconds ? `${data.rate_limit_duration_seconds}s` : '120s'}
            </div>
            <p className="text-[11px] text-slate-700 font-bold">
              Backend configured throttle TTL
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
