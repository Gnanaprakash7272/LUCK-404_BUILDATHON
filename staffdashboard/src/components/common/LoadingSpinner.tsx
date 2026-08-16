import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'Loading academic records...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin mb-3`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );
};
