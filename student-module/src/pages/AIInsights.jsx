import { useEffect, useState } from 'react'
import { getAiInsight } from '../api/students'

import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'

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
      className="h-5 w-5"
    >
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  ),

  Shield: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M12 3l7 3v5c0 4.5-2.9 8.1-7 10-4.1-1.9-7-5.5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
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
      className="h-5 w-5"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),

  Trending: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
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
      className="h-5 w-5"
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
      className="h-4 w-4"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),

  Info: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  ),

  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  ),
}

/* =========================================================
   RISK CONFIG
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
        ring: 'ring-red-100',
        dot: 'bg-red-500',
        description:
          'Your academic indicators require immediate attention.',
      }

    case 'MEDIUM':
      return {
        label: 'Medium Risk',
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        soft: 'bg-amber-100',
        ring: 'ring-amber-100',
        dot: 'bg-amber-500',
        description:
          'Some academic indicators need attention and improvement.',
      }

    case 'LOW':
      return {
        label: 'Low Risk',
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        soft: 'bg-green-100',
        ring: 'ring-green-100',
        dot: 'bg-green-500',
        description:
          'Your current academic indicators are looking healthy.',
      }

    default:
      return {
        label: 'Unknown',
        text: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        soft: 'bg-slate-100',
        ring: 'ring-slate-100',
        dot: 'bg-slate-400',
        description: 'Academic risk information is currently unavailable.',
      }
  }
}

/* =========================================================
   TREND CONFIG
========================================================= */

function getTrendConfig(trend) {
  switch (trend?.toUpperCase()) {
    case 'IMPROVING':
      return {
        label: 'Improving',
        className: 'bg-green-50 text-green-700 border-green-200',
      }

    case 'DECLINING':
      return {
        label: 'Declining',
        className: 'bg-red-50 text-red-700 border-red-200',
      }

    case 'STABLE':
      return {
        label: 'Stable',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      }

    default:
      return {
        label: trend || 'Unavailable',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
      }
  }
}

/* =========================================================
   EVIDENCE CARD
========================================================= */

function EvidenceCard({
  icon,
  label,
  value,
  description,
  iconClass = 'bg-blue-50 text-blue-600',
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
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
   RISK SCORE
========================================================= */

function RiskScore({ score, level }) {
  const risk = getRiskConfig(level)

  const numericScore =
    typeof score === 'number' ? Math.max(0, Math.min(score, 100)) : 0

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-7">
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full border-[10px] border-slate-200`}
        />

        {/* Progress ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              currentColor ${numericScore * 3.6}deg,
              #e2e8f0 ${numericScore * 3.6}deg
            )`,
            color:
              level === 'HIGH'
                ? '#dc2626'
                : level === 'MEDIUM'
                  ? '#d97706'
                  : '#16a34a',
            mask:
              'radial-gradient(farthest-side, transparent calc(100% - 10px), #000 0)',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 10px), #000 0)',
          }}
        />

        <div className="relative text-center">
          <p className={`text-4xl font-bold tracking-tight ${risk.text}`}>
            {score ?? '—'}
          </p>

          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Risk score
          </p>
        </div>
      </div>

      <div
        className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${risk.bg} ${risk.border}`}
      >
        <span className={`h-2 w-2 rounded-full ${risk.dot}`} />

        <span className={`text-xs font-bold uppercase tracking-wide ${risk.text}`}>
          {risk.label}
        </span>
      </div>

      <p className="mt-3 max-w-xs text-center text-sm leading-5 text-slate-500">
        {risk.description}
      </p>
    </div>
  )
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AIInsights() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  async function load() {
    setStatus('loading')

    try {
      const result = await getAiInsight()

      setData(result)
      setStatus('success')
    } catch {
      setStatus('error')
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
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Pulse Intelligence"
          description="Your personalized academic intelligence dashboard."
        />

        <LoadingState rows={5} />
      </div>
    )
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Pulse Intelligence"
          description="Your personalized academic intelligence dashboard."
        />

        <ErrorState onRetry={load} />
      </div>
    )
  }

  /* =======================================================
     DATA
  ======================================================= */

  const {
    risk_level,
    risk_score,
    weak_subject,
    evidence,
    explanation,
    recommendation,
  } = data

  const risk = getRiskConfig(risk_level)
  const trend = getTrendConfig(evidence?.trend)

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        title="Pulse Intelligence"
        description="A data-driven view of your current academic health, risk indicators, and recommended next steps."
      />

      {/* ===================================================
          AI HERO
      =================================================== */}

      <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
        {/* Hero Header */}
        <div className="border-b border-indigo-100 bg-indigo-50/50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Icons.Sparkles />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Academic Intelligence
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
        </div>

        {/* Hero Body */}
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[280px_1fr]">
          <RiskScore
            score={risk_score}
            level={risk_level}
          />

          <div className="flex flex-col justify-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Primary focus area
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {weak_subject || 'Your overall academic progress'}
              </h1>

              {evidence?.weak_subject_avg != null && (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Current subject average:{' '}
                  <span className="font-bold text-slate-800">
                    {evidence.weak_subject_avg}%
                  </span>
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <Icons.Info />

                <p className="text-sm font-bold text-slate-900">
                  What the system found
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {explanation ||
                  'Your academic data has been analysed using the Academic Pulse intelligence engine.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          EVIDENCE
      =================================================== */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
            Evidence
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            What is influencing your assessment?
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These indicators come directly from your academic records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <EvidenceCard
            icon={<Icons.Calendar />}
            label="Attendance"
            value={
              evidence?.attendance_pct != null
                ? `${evidence.attendance_pct}%`
                : '—'
            }
            description={
              evidence?.attendance_pct < 75
                ? 'Below the recommended threshold'
                : 'Currently on track'
            }
            iconClass={
              evidence?.attendance_pct < 75
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-600'
            }
          />

          <EvidenceCard
            icon={<Icons.Book />}
            label="Weak subject"
            value={
              evidence?.weak_subject_avg != null
                ? `${evidence.weak_subject_avg}%`
                : '—'
            }
            description={weak_subject || 'No weak subject detected'}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <EvidenceCard
            icon={<Icons.Clipboard />}
            label="Pending work"
            value={evidence?.pending_assignments ?? '—'}
            description={
              evidence?.pending_assignments === 1
                ? 'Assignment needs attention'
                : 'Pending assignments'
            }
            iconClass={
              evidence?.pending_assignments > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-green-50 text-green-600'
            }
          />

          <EvidenceCard
            icon={<Icons.Trending />}
            label="Performance trend"
            value={trend.label}
            description="Based on recent academic performance"
            iconClass={
              evidence?.trend?.toUpperCase() === 'DECLINING'
                ? 'bg-red-50 text-red-600'
                : evidence?.trend?.toUpperCase() === 'IMPROVING'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-slate-100 text-slate-600'
            }
          />
        </div>
      </section>

      {/* ===================================================
          RECOMMENDATION
      =================================================== */}

      <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="border-b border-indigo-100 bg-indigo-50/50 px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Icons.Sparkles />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Personalized guidance
              </p>

              <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                Recommended next step
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex gap-4">
            <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Icons.Check />
            </div>

            <div>
              <p className="text-base font-semibold leading-6 text-slate-900">
                Based on your current academic indicators
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {recommendation ||
                  'Continue monitoring your academic progress and focus on areas that need improvement.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          DETERMINISTIC ENGINE EXPLANATION
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Icons.Shield />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              How your assessment works
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Academic Pulse first evaluates your academic records using
              deterministic rules. The resulting evidence is then used to
              generate a personalised explanation and recommendation.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  01
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Academic data
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Attendance, grades and assignments.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  02
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Risk assessment
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Deterministic academic risk evaluation.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  03
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  AI explanation
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Personalised explanation and guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          TREND DETAIL
      =================================================== */}

      {evidence?.trend_detail && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Performance history
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Trend detail
              </h2>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${trend.className}`}
            >
              {trend.label}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            {evidence.trend_detail}
          </p>
        </section>
      )}

      {/* ===================================================
          FOOTNOTE
      =================================================== */}

      <div className="flex items-start gap-2 px-1 text-xs leading-5 text-slate-400">
        <Icons.Info />

        <p>
          Your risk score and academic evidence are generated from the
          academic records available in Academic Pulse. AI-generated
          explanations do not replace the underlying deterministic
          assessment.
        </p>
      </div>
    </div>
  )
}