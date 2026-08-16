export default function ErrorState({ title = 'Something went wrong', description = 'We could not load this data. Try again.', onRetry }) {
  return (
    <div className="card p-8 text-center border-risk-high/30">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-risk-highBg text-risk-high">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      </div>
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-soft max-w-sm mx-auto">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  )
}
