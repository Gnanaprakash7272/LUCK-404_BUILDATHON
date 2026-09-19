import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: string;
  trendPositive?: boolean;
  icon: LucideIcon;
  color?: 'cyan' | 'rose' | 'emerald' | 'amber' | 'purple';
  isSimulated?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  trend,
  trendPositive = true,
  icon: Icon,
  color = 'cyan',
  isSimulated = false,
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      iconBg: 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40',
      valColor: 'text-cyan-400',
    },
    rose: {
      border: 'border-rose-500/40 hover:border-rose-400',
      iconBg: 'bg-rose-950/80 text-rose-400 border border-rose-500/40',
      valColor: 'text-rose-400',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400',
      iconBg: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40',
      valColor: 'text-emerald-400',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400',
      iconBg: 'bg-amber-950/80 text-amber-400 border border-amber-500/40',
      valColor: 'text-amber-400',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-400',
      iconBg: 'bg-purple-950/80 text-purple-300 border border-purple-500/40',
      valColor: 'text-purple-300',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      className={`cyber-glass rounded-xl p-5 flex flex-col justify-between group border bg-[#080E1C]/90 shadow-xl transition-all ${scheme.border} font-mono-code`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold tracking-wide text-slate-400 uppercase flex items-center gap-1.5">
            {title}
            {isSimulated && (
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/40 rounded font-bold lowercase">
                sim
              </span>
            )}
          </div>
          <div className={`mt-2 text-2xl lg:text-3xl font-black tracking-tight ${scheme.valColor}`}>
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${scheme.iconBg} transition-transform group-hover:scale-110 shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate max-w-[170px] font-sans" title={description}>
          {description}
        </span>
        {trend && (
          <span
            className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
              trendPositive
                ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40'
                : 'text-rose-400 bg-rose-950/80 border-rose-500/40'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
