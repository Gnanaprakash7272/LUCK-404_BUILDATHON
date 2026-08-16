import { useEffect, useState } from 'react'
import { getDashboard, getAiInsight } from '../api/students'

/* =========================================================
   PRINT STYLES — injected into <head> so they work in new tab
========================================================= */
const PRINT_STYLES = `
  @page {
    size: A4;
    margin: 12mm;
  }

  @media print {
    .no-print {
      display: none !important;
    }
    body {
      background: white !important;
    }
    .report-page {
      box-shadow: none !important;
      border: none !important;
    }
  }
`

/* =========================================================
   RISK HELPERS
========================================================= */
function getRiskColor(level) {
  switch (level) {
    case 'HIGH':   return '#dc2626'
    case 'MEDIUM': return '#d97706'
    case 'LOW':    return '#16a34a'
    default:       return '#64748b'
  }
}

function getRiskBg(level) {
  switch (level) {
    case 'HIGH':   return '#fef2f2'
    case 'MEDIUM': return '#fffbeb'
    case 'LOW':    return '#f0fdf4'
    default:       return '#f8fafc'
  }
}

/* =========================================================
   DIVIDER
========================================================= */
function Divider() {
  return (
    <div style={{
      borderTop: '1px solid #e2e8f0',
      margin: '20px 0',
    }} />
  )
}

/* =========================================================
   SECTION HEADER
========================================================= */
function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <h2 style={{
        margin: 0,
        fontSize: '14px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#334155',
      }}>
        {title}
      </h2>
    </div>
  )
}

/* =========================================================
   DATA ROW
========================================================= */
function DataRow({ label, value, valueStyle = {} }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '7px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>{label}</span>
      <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: '600', textAlign: 'right', maxWidth: '60%', ...valueStyle }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

/* =========================================================
   PERFORMANCE REPORT PAGE
========================================================= */
export default function PerformanceReport() {
  const [dashData, setDashData] = useState(null)
  const [aiData, setAiData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    // Inject print styles
    const style = document.createElement('style')
    style.textContent = PRINT_STYLES
    document.head.appendChild(style)

    async function load() {
      try {
        const [dash, ai] = await Promise.all([
          getDashboard(),
          getAiInsight(),
        ])
        setDashData(dash)
        setAiData(ai)
        setStatus('success')
      } catch (err) {
        setStatus('error')
      }
    }
    load()

    return () => document.head.removeChild(style)
  }, [])

  // Auto-print once data is ready
  useEffect(() => {
    if (status === 'success') {
      // Small delay to ensure the DOM has rendered before triggering print
      const timer = setTimeout(() => window.print(), 600)
      return () => clearTimeout(timer)
    }
  }, [status])

  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  /* ── loading ── */
  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'system-ui', color: '#64748b', fontSize: '14px',
      }}>
        Preparing your report…
      </div>
    )
  }

  /* ── error ── */
  if (status === 'error') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'system-ui', color: '#dc2626', fontSize: '14px',
      }}>
        Failed to load report data. Please ensure you are logged in and try again.
      </div>
    )
  }

  const { profile, stats } = dashData
  const riskLevel = aiData.risk_level
  const riskScore = aiData.risk_score
  const evidence = aiData.evidence || {}

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif' }}>

      {/* Print button — hidden in PDF */}
      <div className="no-print" style={{
        display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '12px',
      }}>
        <button
          onClick={() => window.print()}
          style={{
            background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}
        >
          🖨️ Print / Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px',
            padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {/* ── A4 Report Card ── */}
      <div
        className="report-page"
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          background: 'white',
          boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          borderRadius: '8px',
          padding: '28mm 24mm',
          boxSizing: 'border-box',
          color: '#0f172a',
        }}
      >

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: '#1e40af', color: 'white', borderRadius: '10px',
            padding: '10px 24px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '20px' }}>🎓</span>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.06em' }}>ACADEMIC PULSE</span>
          </div>

          <h1 style={{
            margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a',
          }}>
            Academic Performance Report
          </h1>

          <div style={{ marginTop: '8px', color: '#64748b', fontSize: '12px' }}>
            Generated on {generatedAt} · Confidential Student Record
          </div>

          <div style={{
            marginTop: '16px',
            borderTop: '3px solid #1e40af',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '4px',
          }} />
        </div>

        {/* ── STUDENT INFORMATION ── */}
        <SectionHeader icon="👤" title="Student Information" />
        <DataRow label="Full Name" value={profile?.name} />
        <DataRow label="Roll Number" value={profile?.studentId} />
        <DataRow label="Email Address" value={profile?.email} />
        <DataRow label="Department" value={profile?.department || 'N/A'} />

        <Divider />

        {/* ── ACADEMIC OVERVIEW ── */}
        <SectionHeader icon="📊" title="Academic Overview" />
        <DataRow label="Courses Enrolled" value={stats?.courseCount ?? 0} />
        <DataRow
          label="Overall Attendance"
          value={`${stats?.attendancePct ?? 0}%`}
          valueStyle={{ color: (stats?.attendancePct ?? 0) < 75 ? '#dc2626' : '#16a34a' }}
        />
        <DataRow
          label="Average Performance Score"
          value={`${stats?.averageScore ?? 0}%`}
          valueStyle={{ color: (stats?.averageScore ?? 0) < 60 ? '#dc2626' : '#0f172a' }}
        />
        <DataRow
          label="Pending Assignments"
          value={stats?.pendingAssignments ?? 0}
          valueStyle={{ color: (stats?.pendingAssignments ?? 0) > 0 ? '#d97706' : '#16a34a' }}
        />

        <Divider />

        {/* ── AI RISK ASSESSMENT ── */}
        <SectionHeader icon="🤖" title="AI Risk Assessment" />

        {/* Risk badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
          padding: '12px 16px', borderRadius: '8px',
          background: getRiskBg(riskLevel),
          border: `1px solid ${getRiskColor(riskLevel)}33`,
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: getRiskColor(riskLevel), flexShrink: 0,
          }} />
          <div>
            <span style={{ fontWeight: '700', color: getRiskColor(riskLevel), fontSize: '14px' }}>
              {riskLevel} RISK
            </span>
            <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '12px' }}>
              Risk Score: {riskScore}/100
            </span>
          </div>
        </div>

        <DataRow label="Risk Score" value={`${riskScore} / 100`} valueStyle={{ color: getRiskColor(riskLevel) }} />
        <DataRow label="Risk Level" value={riskLevel} valueStyle={{ color: getRiskColor(riskLevel) }} />
        <DataRow label="Weak Subject" value={aiData.weak_subject || 'None identified'} />
        <DataRow label="Performance Trend" value={aiData.trend ? aiData.trend.charAt(0) + aiData.trend.slice(1).toLowerCase() : '—'} />

        <Divider />

        {/* ── EVIDENCE ── */}
        <SectionHeader icon="🔍" title="Evidence Summary" />
        <DataRow label="Attendance Percentage" value={`${evidence.attendance_pct ?? stats?.attendancePct ?? 0}%`} />
        <DataRow
          label="Weak Subject Average"
          value={evidence.weak_subject_avg != null ? `${evidence.weak_subject_avg}%` : 'N/A'}
          valueStyle={{ color: evidence.weak_subject_avg < 60 ? '#dc2626' : '#0f172a' }}
        />
        <DataRow label="Pending Tasks" value={aiData.pending_assignments ?? 0} />
        <DataRow label="Academic Trend" value={aiData.trend ? aiData.trend.charAt(0) + aiData.trend.slice(1).toLowerCase() : '—'} />

        <Divider />

        {/* ── AI EXPLANATION ── */}
        <SectionHeader icon="💡" title="AI Insight" />
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
          padding: '14px 16px', fontSize: '13px', lineHeight: '1.7', color: '#334155',
          marginBottom: '14px',
        }}>
          {aiData.explanation || 'No explanation available.'}
        </div>

        {/* ── AI RECOMMENDATION ── */}
        <SectionHeader icon="✅" title="AI Recommendation" />
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
          padding: '14px 16px', fontSize: '13px', lineHeight: '1.7', color: '#1e40af',
        }}>
          {aiData.recommendation || 'Continue monitoring your academic progress.'}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: '32px', paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: '#94a3b8', fontSize: '11px',
        }}>
          <span>Generated by Academic Pulse · AI Risk Engine v1.0</span>
          <span>This report is auto-generated from live academic data. Values may not be hardcoded.</span>
        </div>

      </div>
    </div>
  )
}
