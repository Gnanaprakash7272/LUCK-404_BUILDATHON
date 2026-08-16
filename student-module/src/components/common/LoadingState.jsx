export default function LoadingState({ label = 'Loading…', rows = 3 }) {
  return (
    <div className="card p-6" role="status" aria-live="polite">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-4 w-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-sm text-ink-soft">{label}</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-surface-sunk animate-pulse" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </div>
    </div>
  )
}
