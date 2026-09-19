import React from 'react';

interface StatusIndicatorProps {
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  showPulse = true,
}) => {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const statusStyles = {
    ONLINE: {
      dot: 'bg-emerald-400',
      pulse: 'bg-emerald-400',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    WARNING: {
      dot: 'bg-amber-400',
      pulse: 'bg-amber-400',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30',
    },
    OFFLINE: {
      dot: 'bg-red-500',
      pulse: 'bg-red-500',
      text: 'text-red-400',
      badgeBg: 'bg-red-500/10 border-red-500/30',
    },
  };

  const current = statusStyles[status];

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex items-center justify-center">
        {showPulse && status === 'ONLINE' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pulse}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSizes[size]} ${current.dot}`} />
      </span>
      {label && <span className={`text-xs font-mono-code font-semibold tracking-wide ${current.text}`}>{label}</span>}
    </div>
  );
};
