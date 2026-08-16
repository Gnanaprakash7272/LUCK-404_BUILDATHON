import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  badgeText?: string;
  badgeVariant?: 'blue' | 'amber' | 'red' | 'green';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeVariant = 'blue',
  onClick
}) => {
  const badgeColors = {
    blue: 'bg-brand-50 text-brand-600 border-brand-200',
    amber: 'bg-risk-mediumBg text-risk-medium border-risk-medium/20',
    red: 'bg-risk-highBg text-risk-high border-risk-high/20',
    green: 'bg-risk-low text-risk-low border-risk-low/20',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl border border-surface-border p-5 shadow-card hover:shadow-cardHover transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-brand-200 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-ink-faint uppercase tracking-wider">{title}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-sunk text-ink-soft">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-display font-semibold tracking-tight text-ink">{value}</span>
        {badgeText && (
          <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wide rounded-md border ${badgeColors[badgeVariant]}`}>
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs font-medium text-ink-soft">{subtitle}</p>
      )}
    </div>
  );
};
