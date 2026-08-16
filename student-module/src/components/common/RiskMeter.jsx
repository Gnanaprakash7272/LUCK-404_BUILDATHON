// Redesigned premium risk meter
export default function RiskMeter({ score = 0, level = 'LOW' }) {
  const clamped = Math.max(0, Math.min(100, score))
  const levelColor = {
    LOW: '#16A34A',
    MEDIUM: '#D97706',
    HIGH: '#DC2626',
  }[level] || '#64748B'

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-2">
        <span className="font-display text-4xl font-bold tracking-tight" style={{ color: levelColor }}>
          {clamped}
        </span>
        <span className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wider">Risk Score</span>
      </div>
      <div className="relative h-2.5 w-full rounded-full overflow-hidden flex bg-surface-sunk shadow-inner">
        <div className="flex-1 border-r border-white/20 transition-all duration-300" style={{ backgroundColor: clamped <= 33 ? levelColor : '#DCFCE7' }} />
        <div className="flex-1 border-r border-white/20 transition-all duration-300" style={{ backgroundColor: clamped > 33 && clamped <= 66 ? levelColor : '#FEF3C7' }} />
        <div className="flex-1 transition-all duration-300" style={{ backgroundColor: clamped > 66 ? levelColor : '#FEE2E2' }} />
        
        <div
          className="absolute top-0 bottom-0 w-[4px] rounded-full bg-ink shadow-sm transition-all duration-500 ease-out"
          style={{ left: `calc(${clamped}% - 2px)` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-ink-faint uppercase tracking-wider">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  )
}
