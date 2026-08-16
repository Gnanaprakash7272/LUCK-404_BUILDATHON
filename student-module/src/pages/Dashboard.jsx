import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/students'

import Avatar from '../components/common/Avatar'
import Badge from '../components/common/Badge'
import DataTable from '../components/common/DataTable'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import UnauthorizedState from '../components/common/UnauthorizedState'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/* =========================================================
   ICONS
========================================================= */

const Icons = {
  Sparkles: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  ),

  Book: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 5.5V21" />
    </svg>
  ),

  Calendar: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),

  TrendingUp: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  ),

  Clipboard: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3" />
    </svg>
  ),

  ArrowRight: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),

  CheckCircle: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  ),

  AlertCircle: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  ),
}

/* =========================================================
   HELPERS
========================================================= */

function getRiskConfig(level) {
  switch (level) {
    case 'HIGH':
      return {
        label: 'High Risk',
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        soft: 'bg-red-100',
        dot: 'bg-red-500',
      }

    case 'MEDIUM':
      return {
        label: 'Medium Risk',
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        soft: 'bg-amber-100',
        dot: 'bg-amber-500',
      }

    case 'LOW':
      return {
        label: 'Low Risk',
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        soft: 'bg-green-100',
        dot: 'bg-green-500',
      }

    default:
      return {
        label: 'Risk Unavailable',
        text: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        soft: 'bg-slate-100',
        dot: 'bg-slate-400',
      }
  }
}

function getAttendanceStatus(value) {
  if (value < 75) return 'Needs attention'
  if (value < 85) return 'On track'
  return 'Excellent'
}

function getScoreStatus(value) {
  if (value < 60) return 'Needs improvement'
  if (value < 75) return 'Fair progress'
  return 'Strong performance'
}

function getTrendLabel(trend) {
  if (!trend) return 'No trend data'

  switch (trend.toUpperCase()) {
    case 'DECLINING':
      return 'Declining'
    case 'IMPROVING':
      return 'Improving'
    case 'STABLE':
      return 'Stable'
    default:
      return trend
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  description,
  iconClass = 'bg-blue-50 text-blue-600',
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-400">
          Academic Pulse
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-xs font-medium text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   AI HERO
========================================================= */

function AIHero({ aiInsight }) {
  if (!aiInsight) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icons.Sparkles />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Pulse Intelligence
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              AI insights currently unavailable
            </h2>
          </div>
        </div>
      </div>
    )
  }

  const risk = getRiskConfig(aiInsight.riskLevel)

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-indigo-50/50 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Icons.Sparkles />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Pulse Intelligence
            </p>

            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
              Your academic health at a glance
            </h2>
          </div>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 ${risk.bg} ${risk.border}`}
        >
          <span className={`h-2 w-2 rounded-full ${risk.dot}`} />

          <span className={`text-xs font-bold uppercase tracking-wide ${risk.text}`}>
            {risk.label}
          </span>
        </div>
      </div>

      <div className="p-7">
        {/* Main metrics */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Risk Score
            </p>

            <div className="mt-2 flex items-end gap-1">
              <span className={`text-3xl font-bold ${risk.text}`}>
                {aiInsight.riskScore ?? '--'}
              </span>

              <span className="mb-1 text-sm text-slate-400">/100</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Attendance
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {aiInsight.evidence?.attendance_pct ??
                aiInsight.attendancePct ??
                '--'}
              %
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Weak Subject
            </p>

            <p className="mt-2 truncate text-lg font-bold text-slate-900">
              {aiInsight.weakSubject || 'General'}
            </p>

            {aiInsight.evidence?.weak_subject_avg != null && (
              <p className="mt-1 text-xs font-medium text-slate-500">
                Average {aiInsight.evidence.weak_subject_avg}%
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {aiInsight.pendingAssignments ?? '--'}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              assignment
              {aiInsight.pendingAssignments === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Trend */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">
            Recent trend:
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${aiInsight.trend?.toUpperCase() === 'DECLINING'
                ? 'bg-red-50 text-red-600'
                : aiInsight.trend?.toUpperCase() === 'IMPROVING'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
          >
            {getTrendLabel(aiInsight.trend)}
          </span>
        </div>

        {/* Explanation */}
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <Icons.AlertCircle />

              <h3 className="font-semibold text-slate-900">
                What we found
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {aiInsight.explanation ||
                'Your academic data is being analysed.'}
            </p>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="flex items-center gap-2 text-indigo-600">
              <Icons.Sparkles />

              <h3 className="font-semibold text-slate-900">
                Recommended next step
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {aiInsight.recommendation ||
                'Continue monitoring your academic progress.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Link
            to="/ai-insights"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            View full AI analysis
            <Icons.ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  async function load() {
    setStatus('loading')

    try {
      const result = await getDashboard()

      setData(result)
      setStatus('success')
    } catch (err) {
      if (err.response?.status === 401) {
        setStatus('unauthorized')
      } else {
        setStatus('error')
      }
    }
  }

  useEffect(() => {
    load()
  }, [])

  /* =======================================================
     LOADING
  ======================================================= */

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <LoadingState label="Loading your academic dashboard…" rows={5} />
      </div>
    )
  }

  /* =======================================================
     AUTH
  ======================================================= */

  if (status === 'unauthorized') {
    return <UnauthorizedState />
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-7xl">
        <ErrorState onRetry={load} />
      </div>
    )
  }

  /* =======================================================
     DATA
  ======================================================= */

  const {
    profile,
    stats,
    recentGrades,
    upcomingAssignments,
    aiInsight,
    courseProgress,
  } = data

  const attendance = Number(stats?.attendancePct ?? 0)
  const averageScore = Number(stats?.averageScore ?? 0)

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Student Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good to see you, {profile?.name?.split(' ')[0] || 'Student'}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's a quick look at your academic progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/report', '_blank')}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <path d="M12 16V4" /><path d="m8 12 4 4 4-4" />
              <rect x="3" y="18" width="18" height="3" rx="1.5" />
            </svg>
            Download PDF Report
          </button>

          <Link
            to="/progress"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            View progress
            <Icons.ArrowRight />
          </Link>
        </div>
      </header>

      {/* ===================================================
          AI HERO
      =================================================== */}

      <AIHero aiInsight={aiInsight} />

      {/* ===================================================
          METRICS
      =================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Academic overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your key academic indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Icons.Book />}
            label="Courses"
            value={stats?.courseCount ?? 0}
            description="Currently enrolled"
            iconClass="bg-blue-50 text-blue-600"
          />

          <MetricCard
            icon={<Icons.Calendar />}
            label="Attendance"
            value={`${attendance}%`}
            description={getAttendanceStatus(attendance)}
            iconClass={
              attendance < 75
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-600'
            }
          />

          <MetricCard
            icon={<Icons.TrendingUp />}
            label="Average score"
            value={`${averageScore}%`}
            description={getScoreStatus(averageScore)}
            iconClass={
              averageScore < 60
                ? 'bg-red-50 text-red-600'
                : 'bg-indigo-50 text-indigo-600'
            }
          />

          <MetricCard
            icon={<Icons.Clipboard />}
            label="Pending assignments"
            value={stats?.pendingAssignments ?? 0}
            description={
              stats?.pendingAssignments > 0
                ? 'Needs your attention'
                : 'All caught up'
            }
            iconClass={
              stats?.pendingAssignments > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-green-50 text-green-600'
            }
          />
        </div>
      </section>

      {/* ===================================================
          ANALYTICS GRID
      =================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* SUBJECT PERFORMANCE */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Subject performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current progress across your courses.
              </p>
            </div>

            <Link
              to="/progress"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Detailed view
            </Link>
          </div>

          <div className="h-72 p-5">
            {courseProgress?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseProgress}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                  barSize={30}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="course"
                    tick={{
                      fontSize: 12,
                      fill: '#64748B',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 12,
                      fill: '#64748B',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: '#F8FAFC',
                    }}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      boxShadow:
                        '0 8px 20px rgba(15, 23, 42, 0.08)',
                    }}
                  />

                  <Bar
                    dataKey="completionPct"
                    name="Completion %"
                    fill="#2563EB"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No course performance data available.
              </div>
            )}
          </div>
        </section>

        {/* TASK TIMELINE */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Assignment timeline
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Keep track of your academic workload.
              </p>
            </div>

            <Link
              to="/assignments"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              All assignments
            </Link>
          </div>

          <div className="space-y-3 p-5">
            {upcomingAssignments?.length ? (
              upcomingAssignments.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${task.status === 'Pending'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-green-50 text-green-600'
                      }`}
                  >
                    {task.status === 'Pending' ? (
                      <Icons.Calendar />
                    ) : (
                      <Icons.CheckCircle />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {task.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {task.course}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-medium text-slate-500">
                      {task.dueDate}
                    </p>

                    <Badge
                      variant={
                        task.status === 'Pending'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Icons.CheckCircle />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  You're all caught up
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  No upcoming assignments.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ===================================================
          RECENT GRADES
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Recent grades
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your latest academic results.
            </p>
          </div>

          <Link
            to="/grades"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all grades
          </Link>
        </div>

        <div className="overflow-x-auto px-2 py-2">
          <DataTable
            emptyMessage="No grades recorded yet."
            columns={[
              {
                key: 'subject',
                header: 'Subject',
                render: (row) => (
                  <span className="font-semibold text-slate-800">
                    {row.subject}
                  </span>
                ),
              },
              {
                key: 'exam',
                header: 'Assessment',
                render: (row) => (
                  <span className="text-slate-500">
                    {row.exam}
                  </span>
                ),
              },
              {
                key: 'marks',
                header: 'Score',
                render: (row) => (
                  <span className="font-mono text-sm font-semibold text-slate-800">
                    {row.marks}/{row.maxMarks ?? 100}
                  </span>
                ),
              },
              {
                key: 'grade',
                header: 'Grade',
                render: (row) => (
                  <Badge
                    variant={
                      row.grade === 'A' || row.grade === 'B'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {row.grade}
                  </Badge>
                ),
              },
            ]}
            rows={recentGrades?.slice(0, 5) || []}
          />
        </div>
      </section>
    </div>
  )
}