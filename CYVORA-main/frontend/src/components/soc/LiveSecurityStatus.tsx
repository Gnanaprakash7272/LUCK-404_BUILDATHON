import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Activity, Zap, Sparkles, CheckCircle2, WifiOff } from 'lucide-react';
import { fetchPreventionStatus } from '../../services/preventionService';

export const LiveSecurityStatus: React.FC = () => {
  const [preventionStatusStr, setPreventionStatusStr] = useState<string>('ACTIVE');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      const res = await fetchPreventionStatus();
      setIsConnected(res.isConnected);
      if (res.isConnected && res.data) {
        setPreventionStatusStr(res.data.status ? res.data.status.toUpperCase() : 'ACTIVE');
      } else if (!res.isConnected) {
        setPreventionStatusStr('Backend Disconnected');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusItems = [
    {
      title: 'SYSTEM STATUS',
      value: isConnected ? 'OPERATIONAL' : 'DEGRADED',
      icon: ShieldCheck,
      color: isConnected ? 'text-emerald-700' : 'text-amber-700',
      bg: isConnected ? 'bg-emerald-50' : 'bg-amber-50',
      border: isConnected ? 'border-emerald-200' : 'border-amber-200',
      dot: isConnected ? 'bg-emerald-600' : 'bg-amber-600',
    },
    {
      title: 'AI DETECTION ENGINE',
      value: 'ACTIVE',
      icon: Cpu,
      color: 'text-sky-700',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      dot: 'bg-sky-600',
    },
    {
      title: 'PREVENTION ENGINE',
      value: isConnected ? preventionStatusStr : 'DISCONNECTED',
      icon: Zap,
      color: isConnected ? 'text-cyan-700' : 'text-rose-700',
      bg: isConnected ? 'bg-cyan-50' : 'bg-rose-50',
      border: isConnected ? 'border-cyan-200' : 'border-rose-200',
      dot: isConnected ? 'bg-cyan-600' : 'bg-rose-600',
    },
    {
      title: 'NETWORK MONITORING',
      value: 'ACTIVE',
      icon: Activity,
      color: 'text-sky-700',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      dot: 'bg-sky-600',
    },
    {
      title: 'MODEL VERSION',
      value: 'V21.1',
      icon: Sparkles,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      dot: 'bg-purple-600',
    },
  ];

  return (
    <section className="space-y-3 font-mono-code">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          <span>REAL-TIME SOC PLATFORM HEALTH</span>
        </h3>
        <div className="flex items-center gap-2">
          {!isConnected && (
            <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Backend Disconnected
            </span>
          )}
          <span className="text-[11px] text-sky-700 font-bold">TELEMETRY LATENCY: 0.2ms</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statusItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`white-card p-4 border ${item.border} ${item.bg} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  {item.title}
                </span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                <span className={`text-xs sm:text-sm font-extrabold tracking-wider ${item.color} truncate`}>
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
