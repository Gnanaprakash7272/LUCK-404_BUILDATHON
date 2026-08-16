export default function Avatar({ name = 'Student', photoUrl, size = 40 }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.36) }

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={style}
        className="rounded-full object-cover border border-surface-border"
      />
    )
  }

  return (
    <span
      style={style}
      className="flex items-center justify-center rounded-full bg-brand-500 font-semibold text-white shrink-0"
    >
      {initials || 'S'}
    </span>
  )
}
