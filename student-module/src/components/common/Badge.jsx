const VARIANTS = {
  neutral: 'bg-surface-sunk text-ink-soft border-surface-border',
  low: 'bg-risk-lowBg text-risk-low border-risk-low/20',
  medium: 'bg-risk-mediumBg text-risk-medium border-risk-medium/20',
  high: 'bg-risk-highBg text-risk-high border-risk-high/20',
  brand: 'bg-brand-50 text-brand-600 border-brand-100',
  success: 'bg-risk-lowBg text-risk-low border-risk-low/20',
  warning: 'bg-risk-mediumBg text-risk-medium border-risk-medium/20',
  danger: 'bg-risk-highBg text-risk-high border-risk-high/20',
  default: 'bg-surface-sunk text-ink-soft border-surface-border'
}

const STATUS_VARIANT = {
  Enrolled: 'success',
  'Not Enrolled': 'neutral',
  Pending: 'warning',
  Submitted: 'brand',
  Graded: 'success',
  Overdue: 'danger',
  Present: 'success',
  'At Risk': 'warning',
  Absent: 'danger',
  Good: 'success',
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
}

export default function Badge({ children, variant }) {
  const resolved = variant || STATUS_VARIANT[children] || 'neutral'
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] uppercase tracking-wider font-semibold ${VARIANTS[resolved] || VARIANTS.neutral}`}>
      {children}
    </span>
  )
}
