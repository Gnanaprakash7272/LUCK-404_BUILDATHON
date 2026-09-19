import React from 'react';
import { Sparkles, Radio } from 'lucide-react';
import { useDemoMode } from '../../hooks/useDemoMode';
import { Button } from './Button';

interface DemoBannerProps {
  isBackendConnected?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ isBackendConnected = false }) => {
  const { isDemoMode, setDemoMode } = useDemoMode();

  if (!isDemoMode && isBackendConnected) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-y border-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center p-1 rounded bg-amber-100 text-amber-700">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <div>
          <span className="font-bold text-amber-900 tracking-wider font-mono-code mr-2 uppercase">
            DEMO MODE — SIMULATED DATA
          </span>
          <span className="text-amber-800">
            {isBackendConnected
              ? 'FastAPI backend is online. You can switch to Live Mode at any time.'
              : 'Backend is currently offline or unreachable. Displaying realistic simulated SOC flows for project expo.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isBackendConnected && isDemoMode ? (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setDemoMode(false)}
            icon={<Radio className="w-3.5 h-3.5" />}
          >
            Switch to LIVE MODE
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 font-mono-code text-[11px] text-amber-800 bg-amber-100 px-2.5 py-1 rounded border border-amber-300 font-bold">
            <span>EXPO DEMO ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
};
