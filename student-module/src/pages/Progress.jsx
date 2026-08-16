import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getMyProgress } from '../api/students'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function TrendArrow({ change }) {
  const value = Number(change) || 0
  const up = value > 0
  const flat = value === 0

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${flat
          ? 'bg-slate-100 text-slate-500'
          : up
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-600'
        }`}
    >
      {flat ? (
        '—'
      ) : up ? (
        <>
          <span>↑</span>
          {`+${value}`}
        </>
      ) : (
        <>
          <span>↓</span>
          {value}
        </>
      )}
    </span>
  )
}

function TrendIcon({ positive }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${positive
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-red-50 text-red-600'
        }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {positive ? (
          <>
            <path d="m4 16 5-5 4 4 7-8" />
            <path d="M15 7h5v5" />
          </>
        ) : (
          <>
            <path d="m4 8 5 5 4-4 7 8" />
            <path d="M15 17h5v-5" />
          </>
        )}
      </svg>
    </div>
  )
}

function PerformanceIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-5 3 3 5-7" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function SubjectIcon() {
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
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  )
}

function getAverage(data) {
  if (!data?.length) return 0

  const values = data
    .map((item) => Number(item.averageScore))
    .filter((value) => Number.isFinite(value))

  if (!values.length) return 0

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  )
}

export default function Progress() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  async function load() {
    setStatus('loading')

    try {
      const result = await getMyProgress()

      setData(result)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const hasTrendData =
    data?.overallTrend &&
    data.overallTrend.length > 0

  const averageScore = useMemo(
    () => getAverage(data?.overallTrend),
    [data]
  )

  const subjectTrends = data?.subjectTrends || []

  const improvingSubjects = subjectTrends.filter(
    (subject) => Number(subject.change) > 0
  ).length

  const decliningSubjects = subjectTrends.filter(
    (subject) => Number(subject.change) < 0
  ).length

  if (status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <PageHeader title="Progress" />
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoadingState
            label="Loading your academic progress…"
            rows={5}
          />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <PageHeader title="Progress" />
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ErrorState onRetry={load} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-500">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader
        title="Progress"
        description="Understand how your academic performance is changing over time."
      />

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Average */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average performance
              </p>

              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-3xl font-black tracking-tight text-slate-950">
                  {averageScore}
                </span>

                <span className="mb-1 text-sm font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PerformanceIcon />
            </div>
          </div>
        </div>

        {/* Improving */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Improving subjects
              </p>

              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-3xl font-black tracking-tight text-slate-950">
                  {improvingSubjects}
                </span>

                <span className="mb-1 text-sm font-medium text-slate-400">
                  subject{improvingSubjects !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <TrendIcon positive />
          </div>
        </div>

        {/* Attention */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Needs attention
              </p>

              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-3xl font-black tracking-tight text-slate-950">
                  {decliningSubjects}
                </span>

                <span className="mb-1 text-sm font-medium text-slate-400">
                  subject{decliningSubjects !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <TrendIcon positive={false} />
          </div>
        </div>
      </div>

      {/* =====================================================
          OVERALL TREND
      ===================================================== */}

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <PerformanceIcon />
              </div>

              <h2 className="text-base font-black tracking-tight text-slate-950">
                Overall performance
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500 sm:ml-11">
              Your average academic score across recorded assessments.
            </p>
          </div>

          {hasTrendData && (
            <span className="self-start rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
              {data.overallTrend.length} data points
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {!hasTrendData ? (
            <div className="py-10">
              <EmptyState
                title="Not enough data yet"
                description="Your performance trend will appear once more assessments are recorded."
              />
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={data.overallTrend}
                  margin={{
                    top: 15,
                    right: 15,
                    bottom: 5,
                    left: -20,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="progressLineGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366F1"
                      />

                      <stop
                        offset="100%"
                        stopColor="#2563EB"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#E2E8F0"
                    strokeDasharray="4 5"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="period"
                    tick={{
                      fontSize: 11,
                      fill: '#64748B',
                    }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 11,
                      fill: '#64748B',
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      'Average score',
                    ]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      boxShadow:
                        '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
                    }}
                    labelStyle={{
                      color: '#0F172A',
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                    cursor={{
                      stroke: '#CBD5E1',
                      strokeWidth: 1,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="averageScore"
                    name="Average Score"
                    stroke="url(#progressLineGradient)"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                      stroke: '#6366F1',
                      fill: '#FFFFFF',
                    }}
                    activeDot={{
                      r: 6,
                      strokeWidth: 3,
                      stroke: '#FFFFFF',
                      fill: '#6366F1',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SUBJECT TRENDS + ACTION AREAS
      ===================================================== */}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Subject trends */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <SubjectIcon />
              </div>

              <div>
                <h2 className="text-base font-black tracking-tight text-slate-950">
                  Subject trends
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Changes in your recent subject performance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {subjectTrends.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  title="No subject trends"
                  description="Subject-level trends will appear when enough grades are available."
                />
              </div>
            ) : (
              <div className="space-y-2">
                {subjectTrends.map((subject) => {
                  const current = Number(subject.current) || 0
                  const change = Number(subject.change) || 0

                  return (
                    <div
                      key={subject.subject}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-transparent p-4 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {subject.subject}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${current >= 75
                                  ? 'bg-emerald-500'
                                  : current >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, current)
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-[11px] font-semibold text-slate-400">
                            Current average
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-black text-slate-800">
                          {current}%
                        </span>

                        <TrendArrow change={change} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Action areas */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <TargetIcon />
              </div>

              <div>
                <h2 className="text-base font-black tracking-tight text-slate-950">
                  Action areas
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Subjects that may need extra attention.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {data.weakSubjects?.length ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Focus recommendation
                  </p>

                  <p className="mt-1.5 text-sm font-semibold leading-6 text-amber-950">
                    Consider allocating additional study time to these
                    subjects.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {data.weakSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-bold text-slate-700">
                  No weak subjects flagged
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Keep maintaining your current performance.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}