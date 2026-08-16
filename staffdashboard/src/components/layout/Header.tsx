import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { User, LogOut, ChevronDown, Menu, Settings } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/courses': 'My Courses',
  '/classes': 'My Classes',
  '/assignments': 'Assignments',
  '/attendance': 'Attendance',
  '/exams': 'Examinations',
  '/students': 'Students',
  '/ai-insights': 'AI Risk Intelligence',
  '/schedule': 'Schedule',
  '/gradebook': 'Gradebook',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const getPageTitle = () => {
    if (location.pathname.startsWith('/students/')) return 'Student Profile';
    if (location.pathname.startsWith('/courses/')) return 'Course Details';
    if (location.pathname.startsWith('/classes/')) return 'Class Details';
    if (location.pathname.startsWith('/assignments/') && location.pathname.includes('/submissions')) return 'Grade Submissions';
    if (location.pathname.startsWith('/exams/') && location.pathname.includes('/marks')) return 'Exam Marks';
    return PAGE_TITLES[location.pathname] || 'Academic Pulse';
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-surface-border bg-white/95 backdrop-blur-xl">
      <div className="flex h-[68px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-surface text-ink-soft transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Faculty Portal
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-[11px] font-medium text-ink-faint">
                {getPageTitle()}
              </span>
            </div>
            <h1 className="truncate font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-[11px] font-medium text-ink-faint">Welcome back</p>
            <p className="text-xs font-semibold text-ink">{user?.name ? user.name.split(' ')[0] : 'Faculty'}</p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 rounded-xl border px-1.5 py-1.5 pr-2.5 transition-all duration-200 ${
                menuOpen ? 'border-brand-200 bg-brand-50' : 'border-surface-border bg-white hover:border-brand-200 hover:bg-brand-50'
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shadow-inner">
                {user?.name?.charAt(0) || 'F'}
              </div>
              <span className="hidden max-w-[120px] truncate text-xs font-semibold text-ink sm:block">
                {user?.name || 'Faculty'}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 z-50 w-64 overflow-hidden rounded-2xl border border-surface-border bg-white shadow-cardHover animate-in fade-in zoom-in-95 duration-150">
                <div className="border-b border-surface-border bg-surface-sunk px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shadow-inner shrink-0">
                      {user?.name?.charAt(0) || 'F'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{user?.name || 'Faculty'}</p>
                      <p className="truncate text-xs text-ink-faint">{user?.email || 'Faculty Account'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { setMenuOpen(false); navigate('/settings'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-ink-soft transition hover:bg-surface-sunk hover:text-ink">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-sunk text-ink-soft">
                      <Settings className="h-4 w-4" />
                    </span>
                    <span>Account Settings</span>
                  </button>
                  <div className="my-1.5 h-px bg-surface-border" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-risk-high transition hover:bg-risk-highBg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-risk-highBg text-risk-high">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
