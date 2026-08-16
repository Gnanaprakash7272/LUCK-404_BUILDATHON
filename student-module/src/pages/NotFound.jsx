import { Link } from 'react-router-dom'

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function HomeIcon() {
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
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
      <path d="M8.5 11h5" />
      <path d="M11 8.5v5" />
    </svg>
  )
}

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <SearchIcon />
          </div>

          {/* Error code */}
          <div className="mt-7">
            <p className="text-7xl font-black tracking-[-0.06em] text-slate-950 sm:text-8xl">
              404
            </p>

            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-indigo-500" />
          </div>

          {/* Message */}
          <div className="mt-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Page not found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              The page you're looking for doesn't exist or may have
              been moved. Let's get you back to your academic workspace.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 sm:w-auto"
            >
              <HomeIcon />
              Back to dashboard
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            >
              Go back
              <ArrowIcon />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-9 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                A
              </div>

              <span className="text-xs font-bold text-slate-500">
                Academic Pulse
              </span>
            </div>
          </div>
        </div>

        {/* Small footer text */}
        <p className="mt-5 text-center text-[11px] font-medium text-slate-400">
          Student Academic Intelligence Platform
        </p>
      </div>
    </div>
  )
}