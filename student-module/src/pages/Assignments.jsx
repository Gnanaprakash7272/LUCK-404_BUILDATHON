import { useEffect, useMemo, useState } from 'react'
import { getMyAssignments } from '../api/students'
import { submitAssignment } from '../api/assignments'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

const FILTERS = ['All', 'Pending', 'Submitted', 'Graded', 'Overdue']

/* =========================================================
   ICONS
========================================================= */

const Icons = {
  Clipboard: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3" />
    </svg>
  ),

  Clock: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),

  CheckCircle: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  ),

  Award: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="m8.5 12.5-1 8 4.5-2.5 4.5 2.5-1-8" />
    </svg>
  ),

  ExternalLink: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M14 5h5v5" />
      <path d="m19 5-8 8" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </svg>
  ),

  Send: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),

  Alert: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  ),
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, label, value, description, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs font-medium text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
}

/* =========================================================
   STATUS CONFIG
========================================================= */

function getStatusConfig(status) {
  switch (status) {
    case 'Pending':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      }

    case 'Submitted':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      }

    case 'Graded':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
      }

    case 'Overdue':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
      }

    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      }
  }
}

/* =========================================================
   STATUS BADGE
========================================================= */

function AssignmentStatus({ status }) {
  const config = getStatusConfig(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  )
}

/* =========================================================
   SUBMISSION FORM
========================================================= */

function SubmitCell({ assignment, onSubmitted }) {
  const [contentRef, setContentRef] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  if (
    assignment.status !== 'Pending' &&
    assignment.status !== 'Overdue'
  ) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icons.CheckCircle />
        Submission received
      </div>
    )
  }

  async function handleSubmit() {
    if (!contentRef.trim()) {
      setError('Please provide your submission link.')
      return
    }

    setState('loading')
    setError('')

    try {
      await submitAssignment(assignment.id, contentRef.trim())

      setState('success')
      onSubmitted(assignment.id)
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Submission failed.'
      )

      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
        <Icons.CheckCircle />
        Submitted successfully
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            placeholder="Paste Google Drive, GitHub or Docs link"
            value={contentRef}
            onChange={(e) => setContentRef(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            disabled={state === 'loading'}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={state === 'loading'}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icons.Send />

          {state === 'loading' ? 'Sending…' : 'Submit'}
        </button>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <Icons.Alert />
          {error}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   ASSIGNMENT ROW
========================================================= */

function AssignmentCard({ assignment, onSubmitted }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Top */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AssignmentStatus status={assignment.status} />

            {assignment.marks != null && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                Score: {assignment.marks}/100
              </span>
            )}
          </div>

          <h3 className="mt-3 text-base font-bold text-slate-900">
            {assignment.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {assignment.course}
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 lg:items-end">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Due date
          </p>

          <p
            className={`text-sm font-semibold ${assignment.status === 'Overdue'
                ? 'text-red-600'
                : 'text-slate-800'
              }`}
          >
            {assignment.dueDate}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-slate-100" />

      {/* Action */}
      <div className="flex flex-col gap-3">
        {assignment.status === 'Pending' ||
          assignment.status === 'Overdue' ? (
          <>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Submit your work
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Paste a link to your completed work.
              </p>
            </div>

            <SubmitCell
              assignment={assignment}
              onSubmitted={onSubmitted}
            />
          </>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Submission status
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Your submission has been recorded.
              </p>
            </div>

            <SubmitCell
              assignment={assignment}
              onSubmitted={onSubmitted}
            />
          </div>
        )}
      </div>
    </article>
  )
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('All')

  async function load() {
    setStatus('loading')

    try {
      const data = await getMyAssignments()

      setAssignments(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  function handleSubmitted(id) {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id
          ? {
            ...assignment,
            status: 'Submitted',
          }
          : assignment
      )
    )
  }

  const counts = useMemo(
    () => ({
      total: assignments.length,
      pending: assignments.filter(
        (a) => a.status === 'Pending'
      ).length,
      submitted: assignments.filter(
        (a) => a.status === 'Submitted'
      ).length,
      graded: assignments.filter(
        (a) => a.status === 'Graded'
      ).length,
      overdue: assignments.filter(
        (a) => a.status === 'Overdue'
      ).length,
    }),
    [assignments]
  )

  const filtered = useMemo(() => {
    if (filter === 'All') {
      return assignments
    }

    return assignments.filter(
      (assignment) => assignment.status === filter
    )
  }, [assignments, filter])

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      {/* ===================================================
          HEADER
      =================================================== */}

      <PageHeader
        title="Assignments"
        description="Stay on top of deadlines, submissions, and academic feedback."
      />

      {/* ===================================================
          SUMMARY
      =================================================== */}

      {status === 'success' && (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Icons.Clipboard />}
            label="Total"
            value={counts.total}
            description="All assignments"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={<Icons.Clock />}
            label="Pending"
            value={counts.pending}
            description={
              counts.pending > 0
                ? 'Needs your attention'
                : 'Nothing pending'
            }
            iconClass={
              counts.pending > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-green-50 text-green-600'
            }
          />

          <StatCard
            icon={<Icons.CheckCircle />}
            label="Submitted"
            value={counts.submitted}
            description="Work submitted"
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={<Icons.Award />}
            label="Graded"
            value={counts.graded}
            description="Results available"
            iconClass="bg-green-50 text-green-600"
          />
        </section>
      )}

      {/* ===================================================
          FILTERS
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const active = filter === item

            const count =
              item === 'All'
                ? counts.total
                : item === 'Pending'
                  ? counts.pending
                  : item === 'Submitted'
                    ? counts.submitted
                    : item === 'Graded'
                      ? counts.graded
                      : counts.overdue

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                {item}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      {status === 'loading' && (
        <LoadingState
          label="Loading assignments…"
          rows={5}
        />
      )}

      {status === 'error' && (
        <ErrorState onRetry={load} />
      )}

      {status === 'success' && filtered.length === 0 && (
        <EmptyState
          title={
            filter === 'All'
              ? 'No assignments yet'
              : `No ${filter.toLowerCase()} assignments`
          }
          description={
            filter === 'All'
              ? 'Your assignments will appear here once they are published.'
              : 'There are currently no assignments matching this filter.'
          }
        />
      )}

      {status === 'success' && filtered.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {filter === 'All'
                  ? 'Your assignments'
                  : `${filter} assignments`}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filtered.length}{' '}
                {filtered.length === 1
                  ? 'assignment'
                  : 'assignments'}{' '}
                shown
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmitted={handleSubmitted}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================================================
          FOOTNOTE
      =================================================== */}

      {status === 'success' && assignments.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-700">
            Tip:
          </span>{' '}
          Submit your work using a shareable Google Drive,
          GitHub, or document link. Make sure the link is accessible
          to your teacher.
        </div>
      )}
    </div>
  )
}