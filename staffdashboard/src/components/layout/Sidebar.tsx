import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, BookOpen, Users, FileCheck2, CalendarCheck, Award, Sparkles, Calendar, BookMarked, LineChart, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/courses', label: 'My Courses', icon: BookOpen },
  { to: '/classes', label: 'My Classes', icon: Users },
  { to: '/assignments', label: 'Assignments', icon: FileCheck2 },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/exams', label: 'Examinations', icon: Award },
  { to: '/students', label: 'Students', icon: Users },
];

const UTILITY_ITEMS = [
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/gradebook', label: 'Gradebook', icon: BookMarked },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const INTELLIGENCE_ITEMS = [
  { to: '/ai-insights', label: 'AI Risk Intelligence', icon: Sparkles },
];

interface SidebarProps {
  onNavigate?: () => void;
  atRiskCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, atRiskCount }) => {
  return (
    <nav className="flex h-full flex-col bg-white" aria-label="Primary navigation">
      
      {/* Brand */}
      <div className="border-b border-surface-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-sm">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              Academic Pulse
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <p className="text-xs font-medium text-ink-faint">Faculty Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        
        {/* Workspace */}
        <div className="mb-7">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Workspace
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-soft hover:bg-surface-sunk hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-500" />}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive ? 'bg-brand-100 text-brand-600' : 'text-ink-faint group-hover:bg-white group-hover:text-ink-soft'
                      }`}>
                        <Icon className="h-[18px] w-[18px] stroke-[1.8]" />
                      </span>
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Intelligence */}
        <div className="border-t border-surface-border pt-5 mb-7">
          <div className="flex items-center justify-between mb-2 px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Intelligence
            </p>
            {atRiskCount !== undefined && atRiskCount > 0 && (
              <span className="h-5 min-w-5 rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-700 flex items-center justify-center">
                {atRiskCount}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {INTELLIGENCE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? 'bg-accent-light text-accent' : 'text-ink-soft hover:bg-accent-light/50 hover:text-accent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isActive ? 'bg-accent-light text-accent' : 'bg-surface-sunk text-ink-faint group-hover:text-accent'
                      }`}>
                        <Icon className="h-[18px] w-[18px] stroke-[1.8]" />
                      </span>
                      <span>{item.label}</span>
                      <span className="ml-auto flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        <span className="text-[9px] font-bold uppercase tracking-wide text-accent">AI</span>
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Utilities */}
        <div className="border-t border-surface-border pt-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Utilities
          </p>
          <div className="space-y-1">
            {UTILITY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-soft hover:bg-surface-sunk hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-500" />}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive ? 'bg-brand-100 text-brand-600' : 'text-ink-faint group-hover:bg-white group-hover:text-ink-soft'
                      }`}>
                        <Icon className="h-[18px] w-[18px] stroke-[1.8]" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-surface-border p-4">
        <div className="rounded-xl border border-surface-border bg-surface-sunk p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink">Academic Pulse</p>
              <p className="mt-0.5 text-[10px] text-ink-faint">Faculty & Staff Portal</p>
            </div>
            <span className="rounded-md bg-brand-50 px-2 py-1 text-[9px] font-bold text-brand-600">v2.0</span>
          </div>
        </div>
      </div>

    </nav>
  );
};
