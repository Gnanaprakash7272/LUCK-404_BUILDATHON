import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/common/PageHeader'
import Avatar from '../components/common/Avatar'

function MailIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function StudentIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M8 6h8" />
      <path d="M8 10h5" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5l7-3 7 3v16" />
      <path d="M9 9h1" />
      <path d="M14 9h1" />
      <path d="M9 13h1" />
      <path d="M14 13h1" />
      <path d="M10 21v-4h4v4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function LogOutIcon() {
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

function InfoCard({ icon, label, value, wide = false }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-colors hover:border-indigo-100 hover:bg-indigo-50/30 ${wide ? 'sm:col-span-2' : ''
        }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-1.5 truncate text-sm font-bold text-slate-900 sm:text-base">
            {value || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()

  const displayName = user?.name || 'Student'
  const email = user?.email || '—'
  const studentId = user?.studentId || '—'
  const department = user?.department || '—'

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in duration-500">
      <PageHeader
        title="Profile"
        description="Manage and view your academic account information."
      />

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-8 sm:px-8 sm:py-10">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="shrink-0">
              <Avatar
                name={displayName}
                photoUrl={user?.photoUrl}
                size={80}
                className="border-4 border-white/20 shadow-xl"
              />
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-200">
                <ShieldIcon />
                Student Account
              </div>

              <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
                {displayName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                <span>{email}</span>

                {studentId !== '—' && (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
                    <span className="font-mono text-xs">
                      {studentId}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="shrink-0">
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                Active
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Account information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your registered student details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<StudentIcon />}
              label="Student ID"
              value={studentId}
            />

            <InfoCard
              icon={<MailIcon />}
              label="Email address"
              value={email}
            />

            <InfoCard
              icon={<BuildingIcon />}
              label="Department"
              value={department}
              wide
            />
          </div>
        </div>

        {/* =================================================
            SECURITY / ACCOUNT
        ================================================= */}

        <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <ShieldIcon />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Account security
                </p>

                <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                  Your account is protected by authenticated access
                  and role-based permissions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-sm"
            >
              <LogOutIcon />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-[8px] font-black text-white">
          A
        </span>

        Academic Pulse · Student Portal
      </div>
    </div>
  )
}