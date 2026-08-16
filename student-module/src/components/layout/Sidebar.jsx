import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/my-courses', label: 'My Courses', icon: 'book' },
  { to: '/courses', label: 'Course Catalog', icon: 'catalog' },
  { to: '/assignments', label: 'Assignments', icon: 'assignment' },
  { to: '/attendance', label: 'Attendance', icon: 'calendar' },
  { to: '/grades', label: 'Grades', icon: 'grade' },
  { to: '/progress', label: 'Progress', icon: 'trend' },
]

const INTELLIGENCE_ITEMS = [
  { to: '/ai-insights', label: 'AI Insights', icon: 'spark' },
]

const ACCOUNT_ITEMS = [
  { to: '/profile', label: 'Profile', icon: 'user' },
]

function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (name) {
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )

    case 'book':
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" />
          <path d="M4 20.5A2.5 2.5 0 016.5 18H20" />
        </svg>
      )

    case 'catalog':
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h10" />
        </svg>
      )

    case 'assignment':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
        </svg>
      )

    case 'grade':
      return (
        <svg {...common}>
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )

    case 'trend':
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      )

    case 'spark':
      return (
        <svg {...common}>
          <path d="m12 2 2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2Z" />
        </svg>
      )

    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      )

    default:
      return null
  }
}

function NavigationItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `
        group relative flex items-center gap-3
        rounded-lg
        px-3 py-2.5
        text-sm font-medium
        transition-all duration-200
        ${isActive
          ? 'bg-brand-50 text-brand-600'
          : 'text-ink-soft hover:bg-surface-sunk hover:text-ink'
        }
        `
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator */}
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-500" />
          )}

          <span
            className={`
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-lg
              transition-colors
              ${isActive
                ? 'bg-brand-100 text-brand-600'
                : 'text-ink-faint group-hover:bg-white group-hover:text-ink-soft'
              }
            `}
          >
            <Icon name={item.icon} />
          </span>

          <span className="truncate">
            {item.label}
          </span>

          {isActive && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ onNavigate }) {
  return (
    <nav
      className="flex h-full flex-col bg-white"
      aria-label="Primary navigation"
    >

      {/* =====================================================
          BRAND
      ===================================================== */}
      <div className="border-b border-surface-border px-5 py-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              bg-brand-500
              text-lg font-bold text-white
              shadow-sm
            "
          >
            A
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              Academic Pulse
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-risk-low" />

              <p className="text-xs font-medium text-ink-faint">
                Student Portal
              </p>
            </div>
          </div>

        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <div className="flex-1 overflow-y-auto px-3 py-5">

        {/* Workspace */}
        <div className="mb-7">

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Workspace
          </p>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavigationItem
                key={item.to}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>

        </div>


        {/* Intelligence */}
        <div className="border-t border-surface-border pt-5">

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Intelligence
          </p>

          <div className="space-y-1">

            {INTELLIGENCE_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-3
                  rounded-lg
                  px-3 py-2.5
                  text-sm font-medium
                  transition-all
                  ${isActive
                    ? 'bg-accent-light text-accent'
                    : 'text-ink-soft hover:bg-accent-light/50 hover:text-accent'
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        ${isActive
                          ? 'bg-accent-light text-accent'
                          : 'bg-surface-sunk text-ink-faint group-hover:text-accent'
                        }
                      `}
                    >
                      <Icon name={item.icon} />
                    </span>

                    <span>
                      {item.label}
                    </span>

                    <span className="ml-auto flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span className="text-[9px] font-bold uppercase tracking-wide text-accent">
                        AI
                      </span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}

          </div>

        </div>


        {/* Account */}
        <div className="mt-6 border-t border-surface-border pt-5">

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Account
          </p>

          <div className="space-y-1">

            {ACCOUNT_ITEMS.map((item) => (
              <NavigationItem
                key={item.to}
                item={item}
                onNavigate={onNavigate}
              />
            ))}

          </div>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div className="border-t border-surface-border p-4">

        <div className="rounded-xl border border-surface-border bg-surface-sunk p-3">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold text-ink">
                Academic Pulse
              </p>

              <p className="mt-0.5 text-[10px] text-ink-faint">
                Student Intelligence Platform
              </p>
            </div>

            <span className="rounded-md bg-brand-50 px-2 py-1 text-[9px] font-bold text-brand-600">
              v2.0
            </span>

          </div>

        </div>

      </div>

    </nav>
  )
}