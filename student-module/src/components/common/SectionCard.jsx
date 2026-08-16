export default function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`card-static px-6 py-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">{title}</h2>}
            {subtitle && <p className="text-xs text-ink-faint mt-1">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
