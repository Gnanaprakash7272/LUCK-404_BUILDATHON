import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/my-courses': 'My Courses',
  '/courses': 'Course Catalog',
  '/assignments': 'Assignments',
  '/attendance': 'Attendance',
  '/grades': 'Grades',
  '/progress': 'Progress',
  '/ai-insights': 'AI Insights',
  '/profile': 'Profile',
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''
        }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2Z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
    </svg>
  )
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const pageTitle =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/courses/')
      ? 'Course Details'
      : 'Academic Pulse')

  const firstName = user?.name
    ? user.name.split(' ')[0]
    : 'Student'

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 w-full border-b border-surface-border bg-white/95 backdrop-blur-xl">

      <div className="flex h-[68px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ==================================================
            LEFT SIDE
        ================================================== */}
        <div className="flex min-w-0 items-center gap-3">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
              border border-surface-border
              bg-surface
              text-ink-soft
              transition-all
              hover:border-brand-200
              hover:bg-brand-50
              hover:text-brand-600
              lg:hidden
            "
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>

          {/* Page Title */}
          <div className="min-w-0">

            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Student Portal
              </span>

              <span className="text-slate-300">
                /
              </span>

              <span className="text-[11px] font-medium text-ink-faint">
                {pageTitle}
              </span>
            </div>

            <h1 className="truncate font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
              {pageTitle}
            </h1>

          </div>
        </div>


        {/* ==================================================
            RIGHT SIDE
        ================================================== */}
        <div className="flex items-center gap-3">

          {/* Welcome */}
          <div className="hidden text-right md:block">
            <p className="text-[11px] font-medium text-ink-faint">
              Welcome back
            </p>

            <p className="text-xs font-semibold text-ink">
              {firstName}
            </p>
          </div>


          {/* Profile */}
          <div
            className="relative"
            ref={menuRef}
          >

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={`
                flex items-center gap-2
                rounded-xl
                border
                px-1.5 py-1.5 pr-2.5
                transition-all duration-200
                ${menuOpen
                  ? 'border-brand-200 bg-brand-50'
                  : 'border-surface-border bg-white hover:border-brand-200 hover:bg-brand-50'
                }
              `}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >

              <Avatar
                name={user?.name}
                photoUrl={user?.photoUrl}
                size={32}
              />

              <span className="hidden max-w-[120px] truncate text-xs font-semibold text-ink sm:block">
                {user?.name || 'Student'}
              </span>

              <ChevronIcon open={menuOpen} />

            </button>


            {/* ==================================================
                DROPDOWN
            ================================================== */}
            {menuOpen && (
              <div
                className="
                  absolute right-0 mt-2
                  z-50
                  w-64
                  overflow-hidden
                  rounded-2xl
                  border border-surface-border
                  bg-white
                  shadow-cardHover
                  animate-in
                  fade-in
                  zoom-in-95
                  duration-150
                "
                role="menu"
              >

                {/* User Information */}
                <div className="border-b border-surface-border bg-surface-sunk px-4 py-4">

                  <div className="flex items-center gap-3">

                    <Avatar
                      name={user?.name}
                      photoUrl={user?.photoUrl}
                      size={40}
                    />

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-ink">
                        {user?.name || 'Student'}
                      </p>

                      <p className="truncate text-xs text-ink-faint">
                        {user?.email || 'Student account'}
                      </p>

                    </div>

                  </div>

                </div>


                {/* Menu Actions */}
                <div className="p-1.5">

                  {/* Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/profile')
                    }}
                    className="
                      flex w-full items-center gap-3
                      rounded-lg
                      px-3 py-2.5
                      text-left text-xs font-medium
                      text-ink-soft
                      transition
                      hover:bg-surface-sunk
                      hover:text-ink
                    "
                    role="menuitem"
                  >

                    <span className="
                      flex h-8 w-8
                      items-center justify-center
                      rounded-lg
                      bg-surface-sunk
                      text-ink-soft
                    ">
                      <ProfileIcon />
                    </span>

                    <span>
                      Profile Settings
                    </span>

                  </button>


                  {/* AI Insights */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/ai-insights')
                    }}
                    className="
                      flex w-full items-center gap-3
                      rounded-lg
                      px-3 py-2.5
                      text-left text-xs font-medium
                      text-accent
                      transition
                      hover:bg-accent-light
                    "
                    role="menuitem"
                  >

                    <span className="
                      flex h-8 w-8
                      items-center justify-center
                      rounded-lg
                      bg-accent-light
                      text-accent
                    ">
                      <SparkIcon />
                    </span>

                    <span>
                      View AI Insights
                    </span>

                  </button>


                  <div className="my-1.5 h-px bg-surface-border" />


                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex w-full items-center gap-3
                      rounded-lg
                      px-3 py-2.5
                      text-left text-xs font-medium
                      text-risk-high
                      transition
                      hover:bg-risk-highBg
                    "
                    role="menuitem"
                  >

                    <span className="
                      flex h-8 w-8
                      items-center justify-center
                      rounded-lg
                      bg-risk-highBg
                      text-risk-high
                    ">
                      <LogoutIcon />
                    </span>

                    <span>
                      Log out
                    </span>

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  )
}