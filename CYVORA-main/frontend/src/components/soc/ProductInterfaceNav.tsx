import React from 'react';
import { LayoutDashboard, Radio, Shield, Network, BarChart2, Cpu, ShieldAlert, Settings, User } from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProductInterfaceNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-monitor', label: 'Detection / Prediction', icon: Radio, badge: 'LIVE' },
    { id: 'threat-intelligence', label: 'Attack Intelligence', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'ai-models', label: 'Model Information', icon: Cpu },
    { id: 'alerts', label: 'System Health', icon: ShieldAlert, badge: '3' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="white-card rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3 font-mono-code">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900 tracking-wider text-sm">CYVORA PLATFORM</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
            SYSTEM OPERATIONAL
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">
            MODEL V21.1
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[10px]">
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
          <User className="w-4 h-4 text-sky-600" />
          <span>ANALYST_01 (SOC CHIEF)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap border ${
                isActive
                  ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-sm'
                  : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    tab.badge === 'LIVE'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
