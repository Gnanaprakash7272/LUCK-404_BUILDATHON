import React, { ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "There are no entries available for the selected view.",
  icon,
  action
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto my-6 shadow-sm">
      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
