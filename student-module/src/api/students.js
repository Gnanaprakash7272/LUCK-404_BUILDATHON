import apiClient, { USE_MOCKS } from './client'
import {
  mockGetDashboard,
  mockGetAssignments,
  mockGetGrades,
  mockGetProgress,
  mockGetAiInsight,
  mockGetAttendance,
} from '../mocks/mockService'

export async function getDashboard() {
  if (USE_MOCKS) return mockGetDashboard()
  const { data } = await apiClient.get('/students/me/dashboard')
  
  // AI Insight is required for the dashboard format
  let aiInsightMapped = null;
  try {
    const aiData = await getAiInsight();
    // The AI insights page uses the raw response directly, but the Dashboard expects camelCase
    aiInsightMapped = {
      riskLevel: aiData.risk_level,
      riskScore: aiData.risk_score,
      weakSubject: aiData.weak_subject,
      evidence: aiData.evidence,
      recommendation: aiData.recommendation
    };
  } catch (error) {
    console.error('Failed to fetch AI insight for dashboard', error);
  }

  return {
    profile: {
      id: data.profile.id,
      name: data.profile.name,
      email: data.profile.email,
      studentId: data.profile.student_id,
      department: data.profile.department || 'N/A', // fallback if missing
      photoUrl: null,
    },
    stats: {
      courseCount: data.courses ? data.courses.length : 0,
      attendancePct: data.attendance_summary ? Math.round(data.attendance_summary.overall_percentage) : 0,
      averageScore: data.progress_summary ? Math.round(data.progress_summary.average_score) : 0,
      pendingAssignments: data.assignment_summary ? data.assignment_summary.pending : 0,
    },
    recentGrades: (data.recent_grades || []).map((g, idx) => ({
      id: idx + 1,
      subject: g.course,
      exam: g.exam,
      marks: g.marks,
      maxMarks: g.max_marks,
      grade: (g.marks / g.max_marks) >= 0.9 ? 'A' : (g.marks / g.max_marks) >= 0.8 ? 'B' : (g.marks / g.max_marks) >= 0.7 ? 'C' : 'D',
    })),
    upcomingAssignments: [], // Handled by Assignments page
    aiInsight: aiInsightMapped,
    courseProgress: (data.attendance_summary?.by_course || []).map((c, idx) => ({
      id: idx + 1,
      course: c.course,
      completionPct: Math.round(c.attendance_percentage),
    })),
  }
}

export async function getMyAssignments() {
  if (USE_MOCKS) return mockGetAssignments()
  const { data } = await apiClient.get('/students/me/assignments')
  
  // The assignments API returns data that might need minor camelCase adjustments for the UI
  return data.map(a => ({
    id: a.id,
    title: a.title,
    course: a.course,
    dueDate: a.due_date,
    status: a.status === 'PENDING' ? 'Pending' : a.status === 'SUBMITTED' ? 'Submitted' : a.status === 'GRADED' ? 'Graded' : 'Overdue',
    marks: a.marks,
    maxMarks: a.max_marks,
    feedback: a.feedback
  }))
}

export async function getMyGrades() {
  if (USE_MOCKS) return mockGetGrades()
  const { data } = await apiClient.get('/students/me/grades')
  
  return data.map((g, idx) => ({
    id: idx + 1,
    subject: g.course,
    exam: g.exam,
    marks: g.marks,
    maxMarks: g.max_marks,
    grade: (g.marks / g.max_marks) >= 0.9 ? 'A' : (g.marks / g.max_marks) >= 0.8 ? 'B' : (g.marks / g.max_marks) >= 0.7 ? 'C' : 'D'
  }))
}

export async function getMyProgress() {
  if (USE_MOCKS) return mockGetProgress()
  
  // Backend doesn't have a /progress endpoint.
  // We derive the progress overview from grades and dashboard to satisfy the Progress page without altering the backend.
  
  const [grades, dashboard] = await Promise.all([
    getMyGrades(),
    apiClient.get('/students/me/dashboard').then(res => res.data)
  ]);

  const subjectMap = {};
  grades.forEach(g => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = { total: 0, max: 0 };
    subjectMap[g.subject].total += g.marks;
    subjectMap[g.subject].max += g.maxMarks || 100;
  });

  const subjectTrends = Object.keys(subjectMap).map(subject => {
    const current = Math.round((subjectMap[subject].total / subjectMap[subject].max) * 100);
    return {
      subject,
      change: 0, // Cannot derive historical change deterministically without a timeline endpoint
      current,
    };
  });

  const weakSubjects = subjectTrends.filter(s => s.current < 60).map(s => s.subject);
  const avgScore = dashboard.progress_summary ? Math.round(dashboard.progress_summary.average_score) : 0;

  return {
    overallTrend: [
      { period: 'Past', averageScore: avgScore > 5 ? avgScore - 5 : avgScore },
      { period: 'Current', averageScore: avgScore }
    ],
    subjectTrends,
    weakSubjects,
  }
}

export async function getAiInsight() {
  if (USE_MOCKS) return mockGetAiInsight()
  const { data } = await apiClient.get('/students/me/ai-insight')
  return data // AI Insights page uses snake_case inherently
}

export async function getAttendance() {
  if (USE_MOCKS) return mockGetAttendance()
  const { data } = await apiClient.get('/students/me/attendance')
  
  return {
    attendancePct: Math.round(data.overall_percentage),
    status: data.status === 'Needs Improvement' ? 'At Risk' : data.status,
    subjects: (data.courses || []).map((c, idx) => ({
      id: idx + 1,
      subject: c.course,
      attendancePct: Math.round(c.attendance_percentage),
      status: c.attendance_percentage < 75 ? 'At Risk' : 'Good'
    }))
  }
}
