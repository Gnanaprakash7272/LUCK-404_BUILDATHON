export default function StatCard({ label, value, unit, icon, tone = 'default' }) {
  const toneClasses = {
    default: 'text-ink',
    good: 'text-risk-low',
    warn: 'text-risk-medium',
    bad: 'text-risk-high',
  }
  return (
    <div className="card px-5 py-6">
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="text-ink-faint">{icon}</div>}
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className={`font-display text-4xl font-bold tracking-tight ${toneClasses[tone]}`}>{value}</span>
        {unit && <span className="text-sm font-medium text-ink-soft mb-1">{unit}</span>}
      </div>
    </div>
  )
}
