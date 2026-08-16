import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Unable to load data",
  message = "Failed to fetch information from server. Please verify network connection.",
  onRetry
}) => {
  return (
    <div className="bg-red-50/50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900 mb-1">{title}</h3>
      <p className="text-xs text-red-700 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-red-300 text-red-800 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};
