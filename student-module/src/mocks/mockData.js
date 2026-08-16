// Mock data. Shapes match the API contracts exactly so swapping to
// real endpoints later requires no changes to any consuming component.

export const mockUser = {
  id: 1,
  name: 'Arun Mehta',
  email: 'arun@example.com',
  studentId: 'STU-2026-0142',
  department: 'Computer Science',
  photoUrl: null,
}

export const mockDashboard = {
  profile: {
    id: 1,
    name: 'Arun Mehta',
    email: 'arun@example.com',
    studentId: 'STU-2026-0142',
    department: 'Computer Science',
    photoUrl: null,
  },
  stats: {
    courseCount: 5,
    attendancePct: 78,
    averageScore: 68,
    pendingAssignments: 2,
  },
  recentGrades: [
    { id: 1, subject: 'Mathematics', exam: 'Unit Test 2', marks: 42, maxMarks: 100, grade: 'D' },
    { id: 2, subject: 'Physics', exam: 'Midterm', marks: 71, maxMarks: 100, grade: 'B' },
    { id: 3, subject: 'English', exam: 'Essay Assessment', marks: 85, maxMarks: 100, grade: 'A' },
    { id: 4, subject: 'Chemistry', exam: 'Unit Test 1', marks: 63, maxMarks: 100, grade: 'C' },
  ],
  upcomingAssignments: [
    { id: 1, title: 'Calculus Problem Set 4', course: 'Mathematics', dueDate: '2026-08-20', status: 'Pending' },
    { id: 2, title: 'Lab Report: Motion', course: 'Physics', dueDate: '2026-08-22', status: 'Pending' },
    { id: 3, title: 'Reading Response', course: 'English', dueDate: '2026-08-18', status: 'Submitted' },
  ],
  aiInsight: {
    riskLevel: 'HIGH',
    riskScore: 82,
    weakSubject: 'Mathematics',
    evidence: {
      attendance_pct: 62,
      weak_subject_avg: 48,
      pending_assignments: 2,
      trend: 'declining',
    },
    recommendation: 'Focus on Mathematics, complete pending assignments, and improve attendance.',
  },
  attendanceSnapshot: {
    attendancePct: 78,
    status: 'At Risk',
  },
  courseProgress: [
    { id: 1, course: 'Mathematics', completionPct: 40 },
    { id: 2, course: 'Physics', completionPct: 65 },
    { id: 3, course: 'English', completionPct: 90 },
    { id: 4, course: 'Chemistry', completionPct: 55 },
    { id: 5, course: 'Computer Science', completionPct: 72 },
  ],
}

export const mockAttendance = {
  attendancePct: 78,
  status: 'At Risk',
  subjects: [
    { id: 1, subject: 'Mathematics', attendancePct: 62, status: 'At Risk' },
    { id: 2, subject: 'Physics', attendancePct: 84, status: 'Good' },
    { id: 3, subject: 'English Literature', attendancePct: 95, status: 'Good' },
    { id: 4, subject: 'Chemistry', attendancePct: 71, status: 'At Risk' },
    { id: 5, subject: 'Computer Science', attendancePct: 88, status: 'Good' },
  ],
}

export const mockCourses = [
  {
    id: 1,
    name: 'Mathematics',
    description: 'Core algebra, calculus foundations, and applied problem solving.',
    category: 'Science & Math',
    teacher: 'Dr. Priya Nair',
    enrollmentStatus: 'Enrolled',
    instructor: 'Dr. Priya Nair',
    schedule: 'Mon / Wed / Fri, 09:00–10:00',
    duration: '16 weeks',
  },
  {
    id: 2,
    name: 'Physics',
    description: 'Mechanics, motion, and energy through lab-driven experiments.',
    category: 'Science & Math',
    teacher: 'Mr. Rohan Das',
    enrollmentStatus: 'Enrolled',
    instructor: 'Mr. Rohan Das',
    schedule: 'Tue / Thu, 11:00–12:30',
    duration: '16 weeks',
  },
  {
    id: 3,
    name: 'English Literature',
    description: 'Critical reading, essay writing, and comparative literature.',
    category: 'Humanities',
    teacher: 'Ms. Fatima Sheikh',
    enrollmentStatus: 'Enrolled',
    instructor: 'Ms. Fatima Sheikh',
    schedule: 'Mon / Wed, 13:00–14:00',
    duration: '12 weeks',
  },
  {
    id: 4,
    name: 'Chemistry',
    description: 'Organic and inorganic chemistry with weekly lab sessions.',
    category: 'Science & Math',
    teacher: 'Dr. Neel Kapoor',
    enrollmentStatus: 'Enrolled',
    instructor: 'Dr. Neel Kapoor',
    schedule: 'Tue / Thu, 09:00–10:30',
    duration: '16 weeks',
  },
  {
    id: 5,
    name: 'Computer Science',
    description: 'Programming fundamentals, data structures, and algorithms.',
    category: 'Technology',
    teacher: 'Mr. Aditya Rao',
    enrollmentStatus: 'Enrolled',
    instructor: 'Mr. Aditya Rao',
    schedule: 'Mon / Fri, 14:00–15:30',
    duration: '14 weeks',
  },
  {
    id: 6,
    name: 'World History',
    description: 'Global history from the 18th century to the present.',
    category: 'Humanities',
    teacher: 'Ms. Leah Thomas',
    enrollmentStatus: 'Not Enrolled',
    instructor: 'Ms. Leah Thomas',
    schedule: 'Wed / Fri, 10:00–11:00',
    duration: '12 weeks',
  },
  {
    id: 7,
    name: 'Studio Art',
    description: 'Drawing, painting, and visual composition fundamentals.',
    category: 'Arts',
    teacher: 'Mr. Daniel Kim',
    enrollmentStatus: 'Not Enrolled',
    instructor: 'Mr. Daniel Kim',
    schedule: 'Thu, 15:00–17:00',
    duration: '10 weeks',
  },
]

export const mockAssignments = [
  { id: 1, title: 'Calculus Problem Set 4', course: 'Mathematics', dueDate: '2026-08-20', status: 'Pending', marks: null, feedback: null },
  { id: 2, title: 'Lab Report: Motion', course: 'Physics', dueDate: '2026-08-22', status: 'Pending', marks: null, feedback: null },
  { id: 3, title: 'Reading Response', course: 'English Literature', dueDate: '2026-08-18', status: 'Submitted', marks: null, feedback: null },
  { id: 4, title: 'Titration Lab Worksheet', course: 'Chemistry', dueDate: '2026-08-10', status: 'Graded', marks: 78, feedback: 'Good methodology, review error analysis.' },
  { id: 5, title: 'Recursion Exercises', course: 'Computer Science', dueDate: '2026-08-05', status: 'Overdue', marks: null, feedback: null },
  { id: 6, title: 'Algebra Quiz Prep', course: 'Mathematics', dueDate: '2026-07-28', status: 'Graded', marks: 45, feedback: 'Revisit quadratic factoring before the next unit test.' },
]

export const mockGrades = [
  { id: 1, subject: 'Mathematics', exam: 'Unit Test 2', marks: 42, maxMarks: 100, grade: 'D' },
  { id: 2, subject: 'Mathematics', exam: 'Unit Test 1', marks: 51, maxMarks: 100, grade: 'C' },
  { id: 3, subject: 'Physics', exam: 'Midterm', marks: 71, maxMarks: 100, grade: 'B' },
  { id: 4, subject: 'Physics', exam: 'Unit Test 1', marks: 66, maxMarks: 100, grade: 'C' },
  { id: 5, subject: 'English Literature', exam: 'Essay Assessment', marks: 85, maxMarks: 100, grade: 'A' },
  { id: 6, subject: 'Chemistry', exam: 'Unit Test 1', marks: 63, maxMarks: 100, grade: 'C' },
  { id: 7, subject: 'Computer Science', exam: 'Midterm', marks: 74, maxMarks: 100, grade: 'B' },
]

export const mockProgress = {
  overallTrend: [
    { period: 'Feb', averageScore: 74 },
    { period: 'Mar', averageScore: 71 },
    { period: 'Apr', averageScore: 69 },
    { period: 'May', averageScore: 65 },
    { period: 'Jun', averageScore: 63 },
    { period: 'Jul', averageScore: 68 },
  ],
  subjectTrends: [
    { subject: 'Mathematics', change: -12, current: 48 },
    { subject: 'Physics', change: 4, current: 71 },
    { subject: 'English Literature', change: 6, current: 85 },
    { subject: 'Chemistry', change: -3, current: 63 },
    { subject: 'Computer Science', change: 9, current: 74 },
  ],
  weakSubjects: ['Mathematics', 'Chemistry'],
}

export const mockAiInsight = {
  risk_level: 'HIGH',
  risk_score: 82,
  weak_subject: 'Mathematics',
  evidence: {
    attendance_pct: 62,
    weak_subject: 'Mathematics',
    weak_subject_avg: 48,
    pending_assignments: 2,
    trend: 'declining',
    trend_detail: 'Average score in Mathematics has dropped 12 points over the last two assessments.',
    risk_score: 82,
    risk_level: 'HIGH',
  },
  recommendation: 'Focus on Mathematics, complete pending assignments, and improve attendance.',
}
