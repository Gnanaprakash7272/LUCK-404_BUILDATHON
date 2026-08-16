import { Link } from 'react-router-dom'

export default function UnauthorizedState() {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunk text-ink-soft">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 118 0v3" />
        </svg>
      </div>
      <p className="font-display text-base font-semibold text-ink">Session expired</p>
      <p className="mt-1 text-sm text-ink-soft">Sign in again to continue.</p>
      <Link to="/login" className="btn-primary mt-4 inline-flex">Go to login</Link>
    </div>
  )
}
