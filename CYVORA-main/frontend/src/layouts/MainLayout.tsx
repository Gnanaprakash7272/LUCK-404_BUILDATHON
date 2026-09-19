import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoBanner } from '../components/common/DemoBanner';
import { useSystemHealth } from '../hooks/useSystemHealth';

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { isBackendConnected } = useSystemHealth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-900 relative">
      {/* Static Subtle Background Grid */}
      <div className="fixed inset-0 pointer-events-none light-grid-bg opacity-40 z-0" />

      {/* Desktop & Mobile Sidebar */}
      <div className={`${mobileOpen ? 'block' : 'hidden md:block'} z-40`}>
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Main App Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 relative z-10 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header */}
        <Header onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />

        {/* Demo Mode / Backend Connection Warning Banner */}
        <DemoBanner isBackendConnected={isBackendConnected} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
