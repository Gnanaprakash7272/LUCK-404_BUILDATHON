import { useEffect, useMemo, useState } from 'react'
import { getMyGrades } from '../api/students'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

const Icons = {
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

  TrendingUp: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M16 6h5v5" />
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

  Target: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),

  Chevron: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
}

/* =========================================================
   HELPERS
========================================================= */

function getPerformanceTone(value) {
  if (value >= 75) {
    return {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      bar: 'bg-green-500',
      label: 'Strong',
    }
  }

  if (value >= 50) {
    return {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
      label: 'Moderate',
    }
  }

  return {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-500',
    label: 'Needs attention',
  }
}

function getGradeTone(marks) {
  if (marks >= 90) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    }
  }

  if (marks >= 75) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    }
  }

  if (marks >= 50) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    }
  }

  return {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  tone = 'indigo',
}) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   SUBJECT PERFORMANCE CARD
========================================================= */

function SubjectCard({ subject, average }) {
  const tone = getPerformanceTone(average)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">
            {subject}
          </p>

          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Subject average
          </p>
        </div>

        <div
          className={`rounded-xl border px-2.5 py-1 ${tone.bg} ${tone.border}`}
        >
          <span
            className={`text-sm font-black ${tone.text}`}
          >
            {average}%
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${tone.bar}`}
            style={{
              width: `${Math.min(
                Math.max(average, 0),
                100
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs font-semibold ${tone.text}`}>
          {tone.label}
        </span>

        <span className="text-[11px] font-medium text-slate-400">
          {average >= 75
            ? 'Above target'
            : average >= 50
              ? 'Keep improving'
              : 'Needs focus'}
        </span>
      </div>
    </div>
  )
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Grades() {
  const [grades, setGrades] = useState([])
  const [status, setStatus] = useState('loading')

  async function load() {
    setStatus('loading')

    try {
      const data = await getMyGrades()

      setGrades(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const bySubject = {}

    grades.forEach((grade) => {
      if (!bySubject[grade.subject]) {
        bySubject[grade.subject] = {
          subject: grade.subject,
          total: 0,
          count: 0,
        }
      }

      bySubject[grade.subject].total +=
        Number(grade.marks) || 0

      bySubject[grade.subject].count += 1
    })

    return Object.values(bySubject).map((subject) => ({
      subject: subject.subject,
      average: Math.round(
        subject.total / subject.count
      ),
    }))
  }, [grades])

  /* =======================================================
     OVERALL METRICS
  ======================================================= */

  const metrics = useMemo(() => {
    if (!grades.length) {
      return {
        overallAverage: 0,
        exams: 0,
        subjects: 0,
        bestSubject: null,
        bestAverage: 0,
      }
    }

    const totalMarks = grades.reduce(
      (sum, grade) =>
        sum + (Number(grade.marks) || 0),
      0
    )

    const overallAverage = Math.round(
      totalMarks / grades.length
    )

    const bestSubject = [...summary].sort(
      (a, b) => b.average - a.average
    )[0]

    return {
      overallAverage,
      exams: grades.length,
      subjects: summary.length,
      bestSubject: bestSubject?.subject || null,
      bestAverage: bestSubject?.average || 0,
    }
  }, [grades, summary])

  /* =======================================================
     LOADING
  ======================================================= */

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Academic Performance" />
        <LoadingState
          label="Loading grades…"
          rows={5}
        />
      </div>
    )
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Academic Performance" />
        <ErrorState onRetry={load} />
      </div>
    )
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!grades.length) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Academic Performance"
          description="Track your examination results and subject-wise performance."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <EmptyState
            title="No grades yet"
            description="Your examination results will appear here once your assessments are recorded."
          />
        </div>
      </div>
    )
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12 animate-in fade-in duration-500">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader
        title="Academic Performance"
        description="Track your examination results, subject averages, and academic progress."
      />

      {/* =====================================================
          TOP STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Icons.Award />}
          label="Overall Average"
          value={`${metrics.overallAverage}%`}
          description="Across all recorded exams"
          tone="indigo"
        />

        <StatCard
          icon={<Icons.Book />}
          label="Subjects"
          value={metrics.subjects}
          description="Subjects with recorded grades"
          tone="blue"
        />

        <StatCard
          icon={<Icons.Target />}
          label="Assessments"
          value={metrics.exams}
          description="Exams and assessments"
          tone="amber"
        />

        <StatCard
          icon={<Icons.TrendingUp />}
          label="Best Subject"
          value={
            metrics.bestSubject
              ? `${metrics.bestAverage}%`
              : '—'
          }
          description={
            metrics.bestSubject || 'No data available'
          }
          tone="green"
        />
      </div>

      {/* =====================================================
          PERFORMANCE OVERVIEW
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 sm:p-7">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Subject Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your average performance across each subject.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Live academic data
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {summary.length === 0 ? (
            <EmptyState title="No subject data yet" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summary.map((subject) => (
                <SubjectCard
                  key={subject.subject}
                  subject={subject.subject}
                  average={subject.average}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          GRADE HISTORY
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 sm:p-7">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Grade History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed results from your examinations and assessments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto p-2 sm:p-4">
          <DataTable
            emptyMessage="No exam records yet."
            columns={[
              {
                key: 'subject',
                header: 'Subject',
                render: (row) => (
                  <div className="min-w-[160px]">
                    <p className="font-semibold text-slate-800">
                      {row.subject}
                    </p>
                  </div>
                ),
              },

              {
                key: 'exam',
                header: 'Assessment',
                render: (row) => (
                  <span className="text-sm text-slate-500">
                    {row.exam}
                  </span>
                ),
              },

              {
                key: 'marks',
                header: 'Score',
                render: (row) => (
                  <span className="font-mono text-sm font-semibold text-slate-800">
                    {row.marks}
                    <span className="text-slate-400">
                      /{row.maxMarks ?? 100}
                    </span>
                  </span>
                ),
              },

              {
                key: 'grade',
                header: 'Grade',
                render: (row) => {
                  const tone = getGradeTone(
                    Number(row.marks) || 0
                  )

                  return (
                    <span
                      className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${tone.bg} ${tone.border} ${tone.text}`}
                    >
                      {row.grade}
                    </span>
                  )
                },
              },
            ]}
            rows={grades}
          />
        </div>
      </section>

      {/* =====================================================
          PERFORMANCE NOTE
      ===================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-white px-5 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <Icons.Target />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">
            Keep building your academic momentum
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your grades are also used by Academic Pulse's
            intelligence layer to understand performance trends
            and identify areas that may need attention.
          </p>
        </div>
      </div>
    </div>
  )
}