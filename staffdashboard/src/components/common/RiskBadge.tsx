import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = 'md'
}) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-md gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-bold rounded-lg gap-2',
  };

  if (normLevel === 'HIGH') {
    return (
      <span className={`inline-flex items-center bg-red-50 text-red-700 border border-red-200 ${sizeClasses[size]}`}>
        <ShieldAlert className={size === 'lg' ? 'w-4 h-4 text-red-600' : 'w-3.5 h-3.5 text-red-600'} />
        <span>HIGH RISK</span>
        {showScore && score !== undefined && (
          <span className="ml-1 pl-1 border-l border-red-300 font-mono">
            {score}
          </span>
        )}
      </span>
    );
  }

  if (normLevel === 'MEDIUM') {
    return (
      <span className={`inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses[size]}`}>
        <AlertTriangle className={size === 'lg' ? 'w-4 h-4 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
        <span>MEDIUM RISK</span>
        {showScore && score !== undefined && (
          <span className="ml-1 pl-1 border-l border-amber-300 font-mono">
            {score}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses[size]}`}>
      <CheckCircle2 className={size === 'lg' ? 'w-4 h-4 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
      <span>STABLE</span>
      {showScore && score !== undefined && (
        <span className="ml-1 pl-1 border-l border-emerald-300 font-mono">
          {score}
        </span>
      )}
    </span>
  );
};
