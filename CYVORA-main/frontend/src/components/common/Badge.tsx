import React from 'react';
import { SeverityLevel } from '../../types/threat';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'severity' | 'rare' | 'online' | 'offline' | 'simulated';
  severity?: SeverityLevel;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  severity = 'LOW',
  className = '',
}) => {
  const baseClass = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase badge-3d transition-colors';

  switch (variant) {
    case 'severity': {
      if (severity === 'CRITICAL') return <span className={`${baseClass} bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>{children}</span>;
      if (severity === 'HIGH') return <span className={`${baseClass} bg-red-50 text-red-700 border border-red-200 ${className}`}>{children}</span>;
      if (severity === 'MEDIUM') return <span className={`${baseClass} bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>{children}</span>;
      return <span className={`${baseClass} bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>{children}</span>;
    }
    case 'rare':
      return (
        <span className={`${baseClass} bg-purple-200 text-black font-black border border-purple-500 shadow-sm ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-900 animate-pulse"></span>
          {children}
        </span>
      );
    case 'online':
      return (
        <span className={`${baseClass} bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {children}
        </span>
      );
    case 'offline':
      return (
        <span className={`${baseClass} bg-red-50 text-red-700 border border-red-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {children}
        </span>
      );
    case 'simulated':
      return (
        <span className={`${baseClass} bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          {children}
        </span>
      );
    case 'outline':
      return (
        <span className={`${baseClass} bg-slate-50 text-slate-700 border border-slate-200 ${className}`}>
          {children}
        </span>
      );
    case 'default':
    default:
      return (
        <span className={`${baseClass} bg-sky-50 text-sky-700 border border-sky-200 ${className}`}>
          {children}
        </span>
      );
  }
};
