import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  BarChart2,
  Shield,
  Zap,
  Cpu,
  Server,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isRare?: boolean;
}

export const Sidebar: React.FC<Props> = ({ collapsed, onToggleCollapse }) => {
  const navItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live-detection', label: 'Detection / Prediction', icon: Radio, badge: 'LIVE' },
    { to: '/threat-analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/attack-intelligence', label: 'Attack Intelligence', icon: Shield },
    { to: '/rare-attacks', label: 'Rare Attacks', icon: Zap, badge: 'V21.1', isRare: true },
    { to: '/ai-prediction', label: 'AI Prediction', icon: Cpu },
    { to: '/model-intelligence', label: 'Model Information', icon: Activity },
    { to: '/api-monitor', label: 'API Status', icon: Server },
    { to: '/system-health', label: 'System Health', icon: ShieldAlert },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/80">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="/logo-transparent.png"
                alt="CYVORA Logo"
                className="w-9 h-9 object-contain drop-shadow-sm flex-shrink-0"
              />
              <div>
                <h1 className="font-bold text-base text-slate-900 tracking-wider flex items-center gap-1.5 leading-tight font-mono-code">
                  CYVORA
                </h1>
                <p className="text-[10px] font-mono-code text-slate-500 font-semibold tracking-wide uppercase">
                  ENTERPRISE SOC
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center">
              <img
                src="/logo-transparent.png"
                alt="CYVORA Logo"
                className="w-8 h-8 object-contain drop-shadow-sm"
              />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors hidden md:flex border border-slate-200"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold font-mono-code transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-sky-600' : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                    />

                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span className="truncate tracking-wide">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono-code font-bold uppercase ${
                              item.isRare
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-600 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Status */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900 font-mono-code tracking-wider">
                CYVORA ENGINE
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono-code font-bold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono-code truncate">V21.1 Ensemble Active</p>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="CYVORA ENGINE: ONLINE">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
