export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunk text-ink-faint">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
        </svg>
      </div>
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-soft max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
