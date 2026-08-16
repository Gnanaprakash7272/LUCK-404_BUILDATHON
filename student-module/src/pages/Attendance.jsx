import { useEffect, useMemo, useState } from 'react'
import { getAttendance } from '../api/students'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

/* =========================================================
   ICONS
========================================================= */

const Icons = {
  Calendar: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),

  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  ),

  Alert: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  ),

  TrendingUp: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m3 17 6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  ),

  Book: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </svg>
  ),
}

/* =========================================================
   HELPERS
========================================================= */

function getAttendanceState(value) {
  if (value >= 85) {
    return {
      label: 'Excellent',
      description: 'Your attendance is in a strong range.',
      color: 'green',
      bar: 'bg-green-500',
      light: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    }
  }

  if (value >= 75) {
    return {
      label: 'Good',
      description: 'You are meeting the recommended attendance level.',
      color: 'blue',
      bar: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    }
  }

  if (value >= 60) {
    return {
      label: 'Needs Attention',
      description: 'Try to attend more classes to improve your percentage.',
      color: 'amber',
      bar: 'bg-amber-500',
      light: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    }
  }

  return {
    label: 'Critical',
    description: 'Your attendance is below the recommended level.',
    color: 'red',
    bar: 'bg-red-500',
    light: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  }
}

function getSubjectState(value) {
  if (value >= 75) {
    return {
      label: 'On Track',
      dot: 'bg-green-500',
      bar: 'bg-green-500',
      badge: 'bg-green-50 text-green-700 border-green-200',
    }
  }

  if (value >= 60) {
    return {
      label: 'Needs Attention',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  }

  return {
    label: 'Critical',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
  }
}

/* =========================================================
   ATTENDANCE RING
========================================================= */

function AttendanceRing({ value }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(value, 0), 100)
  const offset =
    circumference - (progress / 100) * circumference

  const state = getAttendanceState(value)

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg
        viewBox="0 0 128 128"
        className="h-40 w-40 -rotate-90"
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-100"
        />

        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={state.bar.replace('bg-', 'text-')}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value}%
        </span>

        <span className="mt-0.5 text-xs font-semibold text-slate-400">
          Attendance
        </span>
      </div>
    </div>
  )
}

/* =========================================================
   SUBJECT ROW
========================================================= */

function SubjectAttendance({ subject }) {
  const state = getSubjectState(subject.attendancePct)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${state.dot}`}
            />

            <h3 className="truncate text-sm font-bold text-slate-900">
              {subject.subject}
            </h3>
          </div>

          <p className="mt-1 pl-4 text-xs text-slate-400">
            Subject attendance
          </p>
        </div>

        <div
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${state.badge}`}
        >
          {state.label}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">
            Attendance
          </span>

          <span className="text-sm font-bold text-slate-900">
            {subject.attendancePct}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${state.bar}`}
            style={{
              width: `${Math.min(
                Math.max(subject.attendancePct, 0),
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Attendance() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  async function load() {
    setStatus('loading')

    try {
      const result = await getAttendance()

      setData(result)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Attendance"
          description="Monitor your attendance across all subjects."
        />

        <LoadingState rows={5} />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Attendance"
          description="Monitor your attendance across all subjects."
        />

        <ErrorState onRetry={load} />
      </div>
    )
  }

  const subjects = data?.subjects || []
  const attendancePct = Number(data?.attendancePct || 0)

  const overallState = getAttendanceState(attendancePct)

  const subjectStats = useMemo(() => {
    const excellent = subjects.filter(
      (subject) => subject.attendancePct >= 85
    ).length

    const attention = subjects.filter(
      (subject) =>
        subject.attendancePct >= 60 &&
        subject.attendancePct < 75
    ).length

    const critical = subjects.filter(
      (subject) => subject.attendancePct < 60
    ).length

    return {
      excellent,
      attention,
      critical,
    }
  }, [subjects])

  const lowestSubject =
    subjects.length > 0
      ? [...subjects].sort(
        (a, b) => a.attendancePct - b.attendancePct
      )[0]
      : null

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      {/* ===================================================
          HEADER
      =================================================== */}

      <PageHeader
        title="Attendance"
        description="Monitor your attendance and identify subjects that need attention."
      />

      {/* ===================================================
          HERO
      =================================================== */}

      <section
        className={`relative overflow-hidden rounded-3xl border ${overallState.border} ${overallState.light} p-6 shadow-sm sm:p-8`}
      >
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
          <AttendanceRing value={attendancePct} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${overallState.border} ${overallState.text} bg-white/70`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${attendancePct >= 75
                      ? 'bg-green-500'
                      : attendancePct >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                />

                {overallState.label}
              </span>

              <span className="text-xs font-medium text-slate-400">
                Recommended minimum: 75%
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {attendancePct >= 75
                ? 'You are on track.'
                : 'Your attendance needs attention.'}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {overallState.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Overall Status
                </p>

                <p className={`mt-1 text-sm font-bold ${overallState.text}`}>
                  {data?.status || overallState.label}
                </p>
              </div>

              <div className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Subjects
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {subjects.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Icons.Check />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                On Track
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {subjectStats.excellent}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Icons.Alert />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Need Attention
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {subjectStats.attention}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Icons.Alert />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Critical
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {subjectStats.critical}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SUBJECT ATTENDANCE
      =================================================== */}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Subject-wise attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A detailed view of your attendance across subjects.
            </p>
          </div>

          <div className="hidden items-center gap-4 text-xs font-medium text-slate-400 sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              ≥ 75%
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              60–74%
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              &lt; 60%
            </span>
          </div>
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Subject attendance data will appear here once records are available."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {subjects.map((subject) => (
              <SubjectAttendance
                key={subject.subject}
                subject={subject}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===================================================
          ATTENTION CALLOUT
      =================================================== */}

      {lowestSubject &&
        lowestSubject.attendancePct < 75 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                <Icons.Alert />
              </div>

              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Attendance area to watch
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  <span className="font-bold">
                    {lowestSubject.subject}
                  </span>{' '}
                  currently has your lowest attendance at{' '}
                  <span className="font-bold">
                    {lowestSubject.attendancePct}%
                  </span>
                  . Prioritising attendance in this subject can help
                  improve your overall percentage.
                </p>
              </div>
            </div>
          </section>
        )}

      {/* ===================================================
          FOOTNOTE
      =================================================== */}

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
        <Icons.Calendar />

        <span>
          Attendance percentages are calculated from the academic
          records maintained by your institution.
        </span>
      </div>
    </div>
  )
}