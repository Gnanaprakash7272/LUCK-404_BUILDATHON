export default function ProgressBar({ value, tone = 'brand', label }) {
  const clamped = Math.max(0, Math.min(100, value))
  const toneClasses = {
    brand: 'bg-brand-500',
    low: 'bg-risk-low',
    medium: 'bg-risk-medium',
    high: 'bg-risk-high',
  }
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-soft">
          <span className="truncate pr-4">{label}</span>
          <span className="font-mono text-ink-faint shrink-0">{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-surface-sunk shadow-inner overflow-hidden">
        <div
          className={`h-full rounded-full ${toneClasses[tone]} transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
