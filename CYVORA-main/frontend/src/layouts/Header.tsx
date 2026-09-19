import React, { useState, useEffect } from 'react';
import {
  Bell,
  User,
  Radio,
  Clock,
  Sparkles,
  Menu,
  X,
  Shield,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useDemoMode } from '../hooks/useDemoMode';
import { useSystemHealth } from '../hooks/useSystemHealth';

interface Props {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<Props> = ({ onToggleMobileSidebar }) => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { isBackendConnected, responseTimeMs } = useSystemHealth(4000);
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { id: 1, title: 'CRITICAL: Web Attack Intercepted', desc: 'SQL Injection on 192.168.1.42 overridden by Web Specialist', time: '02s ago' },
    { id: 2, title: 'DDoS Burst Suppressed', desc: 'High volumetric flow rate blocked on Port 8080', time: '04m ago' },
    { id: 3, title: 'V21.1 Ensemble Synchronized', desc: 'Random Forest + Extra Trees flow pipeline operational', time: '12m ago' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Left side: Mobile Toggle & SOC Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <img
            src="/logo-transparent.png"
            alt="CYVORA Logo"
            className="w-9 h-9 object-contain drop-shadow-sm flex-shrink-0"
          />

          <div className="flex items-center gap-2.5">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-slate-900 uppercase font-mono-code flex items-center gap-2">
              <span>CYVORA</span>
              <span className="text-sky-700 font-semibold hidden sm:inline">SOC PLATFORM</span>
            </h2>

            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-mono-code text-emerald-800 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>SYSTEM OPERATIONAL</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-[10px] font-mono-code text-purple-800 font-bold">
              <span>MODEL V21.1</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[10px] font-mono-code text-sky-800 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              <span>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side Statuses & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Backend Connected / Latency */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono-code text-[11px]">
          <Activity className="w-3.5 h-3.5 text-sky-600" />
          <span>API:</span>
          {isBackendConnected ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              CONNECTED <span className="text-[10px] text-slate-500 font-normal">({responseTimeMs}ms)</span>
            </span>
          ) : (
            <span className="text-amber-700 font-bold">OFFLINE</span>
          )}
        </div>

        {/* Dynamic UTC Timestamp */}
        <div className="hidden xl:flex items-center gap-1.5 text-slate-700 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono-code text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{time || '00:00:00 UTC'}</span>
        </div>

        {/* Expo Demo / Live Mode Toggle */}
        <button
          onClick={toggleDemoMode}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono-code transition-all ${
            isDemoMode
              ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm'
              : 'bg-sky-50 text-sky-800 border border-sky-300 shadow-sm'
          }`}
          title="Toggle between Demo Mode and Live Mode"
        >
          {isDemoMode ? <Sparkles className="w-3.5 h-3.5 text-amber-600" /> : <Radio className="w-3.5 h-3.5 text-sky-600" />}
          <span>{isDemoMode ? 'DEMO TELEMETRY' : 'LIVE ENGINE'}</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative border border-slate-200 bg-white"
            title="SOC Security Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl p-3.5 space-y-2.5 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-900 font-mono-code uppercase tracking-wider">
                    REAL-TIME SOC ALERTS
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between items-start font-bold text-slate-900 gap-2">
                      <span className="text-rose-700 font-mono-code text-[11px] leading-tight">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono-code flex-shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 font-mono-code leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile / SOC Analyst */}
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 hover:border-sky-400 cursor-pointer transition-colors" title="SOC Chief Security Analyst">
          <div className="w-6 h-6 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 font-bold text-[10px] font-mono-code">
            SA
          </div>
          <span className="hidden xl:inline text-xs font-mono-code font-semibold text-slate-800">ANALYST_01</span>
        </div>
      </div>
    </header>
  );
};
