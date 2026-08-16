import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  atRiskCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, atRiskCount }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileNavOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface-sunk text-ink">
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block h-screen w-[260px] overflow-hidden border-r border-surface-border bg-white">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 bg-surface-sunk">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <main className="min-w-0 w-full">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
          />
          <aside className="relative z-10 h-full w-[280px] max-w-[85vw] overflow-hidden bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-white text-ink-soft hover:bg-surface-sunk hover:text-ink active:scale-95 transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
};
