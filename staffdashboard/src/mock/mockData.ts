import { AtRiskStudent } from '../types/ai';
import {
  TeacherProfile,
  Course,
  ClassGroup,
  Student,
  Assignment,
  AssignmentSubmission,
  Examination,
  ExamMarkEntry
} from '../types/academic';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'RISK_ALERT' | 'SUBMISSION' | 'ATTENDANCE' | 'EXAM';
  timestamp: string;
  read: boolean;
  student_id?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'ATTENDANCE' | 'ASSIGNMENT' | 'EXAM' | 'INTERVENTION';
}

export interface TimetableSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1 to 8
  time_range: string;
  class_id: string;
  class_name: string;
  subject: string;
  staff_id: string;
  staff_name: string;
  room: string;
  is_substitute?: boolean;
  substitute_staff?: string;
}

export interface PTMBookingSlot {
  id: string;
  date: string;
  time_slot: string;
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED';
  parent_name?: string;
}

export interface HeatmapDayRecord {
  date: string; // YYYY-MM-DD
  day_number: number;
  attendance_pct: number;
  marked: boolean;
}

export interface LeaveRequest {
  id: string;
  leave_date: string;
  reason: string;
  period_affected: string;
  substitute_assigned: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface AcademicCalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'EXAM' | 'ASSIGNMENT_DUE' | 'HOLIDAY' | 'FACULTY_MEETING';
}

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-001",
    title: "AI Risk Escalation Alert",
    message: "Student Arun Kumar (11A-01) moved to HIGH RISK due to consecutive missed classes.",
    type: "RISK_ALERT",
    timestamp: "10 mins ago",
    read: false,
    student_id: "std-001"
  },
  {
    id: "notif-002",
    title: "New Submissions Received",
    message: "5 new submissions uploaded for Calculus Problem Set #4 (Grade 11-A).",
    type: "SUBMISSION",
    timestamp: "1 hour ago",
    read: false
  },
  {
    id: "notif-003",
    title: "Attendance Warning Trigger",
    message: "Grade 12-CS morning attendance dropped below 75% average.",
    type: "ATTENDANCE",
    timestamp: "3 hours ago",
    read: true
  },
  {
    id: "notif-004",
    title: "Exam Marks Pending",
    message: "Unit Test 1 — Matrix Algebra marks entry is pending for Grade 11-B.",
    type: "EXAM",
    timestamp: "Yesterday",
    read: true
  }
];

export const mockActivityLogs: ActivityItem[] = [
  {
    id: "act-101",
    action: "Marked Attendance",
    target: "Grade 11-A (28 Students)",
    timestamp: "Today, 09:15 AM",
    category: "ATTENDANCE"
  },
  {
    id: "act-102",
    action: "Graded Submissions",
    target: "Calculus Problem Set #4 (Priya Sharma, Arun Kumar)",
    timestamp: "Today, 10:45 AM",
    category: "ASSIGNMENT"
  },
  {
    id: "act-103",
    action: "Entered Exam Marks",
    target: "Unit Quiz 2 — Data Structures (Grade 12-CS)",
    timestamp: "Yesterday, 03:30 PM",
    category: "EXAM"
  },
  {
    id: "act-104",
    action: "Logged Intervention Note",
    target: "Scheduled 1-on-1 counseling for Arun Kumar",
    timestamp: "Aug 14, 2026",
    category: "INTERVENTION"
  }
];

// 5 Days x 8 Periods Fixed Timetable Grid
export const periodTimeMap: Record<number, string> = {
  1: "09:00 - 09:45 AM",
  2: "09:45 - 10:30 AM",
  3: "10:45 - 11:30 AM",
  4: "11:30 - 12:15 PM",
  5: "01:15 - 02:00 PM",
  6: "02:00 - 02:45 PM",
  7: "03:00 - 03:45 PM",
  8: "03:45 - 04:30 PM",
};

export const mockTimetableGrid: TimetableSlot[] = [
  // Monday
  { day: "Monday", period: 1, time_range: periodTimeMap[1], class_id: "cls-11a", class_name: "Grade 11-A", subject: "Advanced Mathematics", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Hall A-102" },
  { day: "Monday", period: 2, time_range: periodTimeMap[2], class_id: "cls-11a", class_name: "Grade 11-A", subject: "Advanced Mathematics", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Hall A-102" },
  { day: "Monday", period: 4, time_range: periodTimeMap[4], class_id: "cls-11b", class_name: "Grade 11-B", subject: "Linear Algebra", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Room B-204" },
  { day: "Monday", period: 6, time_range: periodTimeMap[6], class_id: "cls-12cs", class_name: "Grade 12-CS", subject: "Data Structures", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Lab CS-3" },

  // Tuesday
  { day: "Tuesday", period: 3, time_range: periodTimeMap[3], class_id: "cls-12cs", class_name: "Grade 12-CS", subject: "Data Structures Lab", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Lab CS-3" },
  { day: "Tuesday", period: 5, time_range: periodTimeMap[5], class_id: "cls-11b", class_name: "Grade 11-B", subject: "Advanced Mathematics", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Hall A-103" },

  // Wednesday
  { day: "Wednesday", period: 1, time_range: periodTimeMap[1], class_id: "cls-11b", class_name: "Grade 11-B", subject: "Advanced Mathematics", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Hall A-103" },
  { day: "Wednesday", period: 7, time_range: periodTimeMap[7], class_id: "cls-11a", class_name: "Grade 11-A", subject: "Linear Algebra Tutorial", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Room B-204" },

  // Thursday
  { day: "Thursday", period: 2, time_range: periodTimeMap[2], class_id: "cls-12cs", class_name: "Grade 12-CS", subject: "Algorithms Lecture", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Lab CS-3" },
  { day: "Thursday", period: 4, time_range: periodTimeMap[4], class_id: "cls-11a", class_name: "Grade 11-A", subject: "Linear Algebra", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Room B-204", is_substitute: true, substitute_staff: "Ms. Lakshmi Devi (Substitute)" },

  // Friday
  { day: "Friday", period: 1, time_range: periodTimeMap[1], class_id: "cls-11a", class_name: "Grade 11-A", subject: "Advanced Mathematics", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Hall A-102" },
  { day: "Friday", period: 3, time_range: periodTimeMap[3], class_id: "cls-12cs", class_name: "Grade 12-CS", subject: "Problem Solving Lab", staff_id: "tch-101", staff_name: "Dr. Eleanor Vance", room: "Lab CS-3" },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "lve-101",
    leave_date: "2026-08-28",
    reason: "Attending National Mathematics Symposium",
    period_affected: "Thursday, Period 4",
    substitute_assigned: "Ms. Lakshmi Devi",
    status: "APPROVED"
  }
];

export const mockAcademicCalendarEvents: AcademicCalendarEvent[] = [
  { id: "evt-1", date: "2026-08-18", title: "Data Structures Lab #3 Due", type: "ASSIGNMENT_DUE" },
  { id: "evt-2", date: "2026-08-20", title: "Calculus PS#4 Due", type: "ASSIGNMENT_DUE" },
  { id: "evt-3", date: "2026-08-22", title: "Parent-Teacher Meeting (PTM)", type: "FACULTY_MEETING" },
  { id: "evt-4", date: "2026-08-25", title: "Midterm Examination — Advanced Calculus", type: "EXAM" },
  { id: "evt-5", date: "2026-08-31", title: "National Academic Holiday", type: "HOLIDAY" },
];

export const mockPTMSlots: PTMBookingSlot[] = [
  { id: "ptm-101", date: "2026-08-22", time_slot: "04:00 - 04:30 PM", status: "AVAILABLE" },
  { id: "ptm-102", date: "2026-08-22", time_slot: "04:30 - 05:00 PM", status: "BOOKED", parent_name: "Mr. Suresh Kumar (Arun's Father)" },
  { id: "ptm-103", date: "2026-08-23", time_slot: "04:00 - 04:30 PM", status: "AVAILABLE" },
  { id: "ptm-104", date: "2026-08-23", time_slot: "04:30 - 05:00 PM", status: "BOOKED", parent_name: "Mrs. Meena Gupta (Rohan's Mother)" },
];

export const mockAttendanceHeatmap: HeatmapDayRecord[] = [
  { date: "2026-08-01", day_number: 1, attendance_pct: 92, marked: true },
  { date: "2026-08-02", day_number: 2, attendance_pct: 88, marked: true },
  { date: "2026-08-03", day_number: 3, attendance_pct: 90, marked: true },
  { date: "2026-08-04", day_number: 4, attendance_pct: 85, marked: true },
  { date: "2026-08-05", day_number: 5, attendance_pct: 71, marked: true },
  { date: "2026-08-08", day_number: 8, attendance_pct: 94, marked: true },
  { date: "2026-08-09", day_number: 9, attendance_pct: 89, marked: true },
  { date: "2026-08-10", day_number: 10, attendance_pct: 68, marked: true },
  { date: "2026-08-11", day_number: 11, attendance_pct: 82, marked: true },
  { date: "2026-08-12", day_number: 12, attendance_pct: 86, marked: true },
  { date: "2026-08-15", day_number: 15, attendance_pct: 62, marked: true },
  { date: "2026-08-16", day_number: 16, attendance_pct: 82, marked: true },
];

export const mockTeacherProfile: TeacherProfile = {
  id: "tch-101",
  name: "Dr. Eleanor Vance",
  email: "eleanor.vance@academy.edu",
  role: "TEACHER",
  department: "Department of Mathematics & Computer Science",
  avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
  assigned_courses_count: 3,
  assigned_classes_count: 4,
};

export const mockAtRiskStudents: AtRiskStudent[] = [
  {
    student_id: "std-001",
    name: "Arun Kumar",
    risk_level: "HIGH",
    risk_score: 82,
    weak_subject: "Mathematics",
    evidence: {
      attendance_pct: 62,
      weak_subject: "Mathematics",
      weak_subject_avg: 48,
      pending_assignments: 2,
      trend: "Declining",
      trend_detail: "Dropped 14% in last 3 weeks due to consecutive missed classes and failed Quiz 2 (38%)."
    },
    recommendation: "Schedule 1-on-1 academic counseling session for Mathematics, assign remedial problem set #3, and closely monitor attendance over next 14 days."
  },
  {
    student_id: "std-002",
    name: "Rohan Gupta",
    risk_level: "HIGH",
    risk_score: 78,
    weak_subject: "Computer Science",
    evidence: {
      attendance_pct: 58,
      weak_subject: "Computer Science",
      weak_subject_avg: 42,
      pending_assignments: 3,
      trend: "Declining",
      trend_detail: "Has not submitted 3 lab assignments in a row. Attendance in morning programming lectures fell below 60%."
    },
    recommendation: "Conduct immediate parent-teacher conference, provide lab assistance for Data Structures, and set strict deadlines for overdue submissions."
  },
  {
    student_id: "std-003",
    name: "Ananya Patel",
    risk_level: "MEDIUM",
    risk_score: 56,
    weak_subject: "Linear Algebra",
    evidence: {
      attendance_pct: 74,
      weak_subject: "Linear Algebra",
      weak_subject_avg: 54,
      pending_assignments: 1,
      trend: "Declining",
      trend_detail: "Scored below class average on vector spaces exam. Attendance is marginally below 75% threshold."
    },
    recommendation: "Assign peer study mentor, invite to Thursday office hours for Linear Algebra concept review, and monitor next assignment."
  },
  {
    student_id: "std-004",
    name: "Rahul Verma",
    risk_level: "MEDIUM",
    risk_score: 52,
    weak_subject: "Mathematics",
    evidence: {
      attendance_pct: 72,
      weak_subject: "Mathematics",
      weak_subject_avg: 58,
      pending_assignments: 1,
      trend: "Declining",
      trend_detail: "Gradual decline over last month. Missed 2 tutorial sessions without prior notification."
    },
    recommendation: "Issue attendance warning notice, provide supplementary problem solving guide, and verify completion of pending assignment."
  },
  {
    student_id: "std-005",
    name: "Priya Sharma",
    risk_level: "LOW",
    risk_score: 18,
    weak_subject: "None",
    evidence: {
      attendance_pct: 94,
      weak_subject: "Computer Science",
      weak_subject_avg: 88,
      pending_assignments: 0,
      trend: "Improving",
      trend_detail: "Consistent high performance across all modules and 100% assignment submission record."
    },
    recommendation: "Student is academically stable. Encourage participation in competitive math & coding olympiad."
  },
  {
    student_id: "std-006",
    name: "Vikram Singh",
    risk_level: "LOW",
    risk_score: 22,
    weak_subject: "None",
    evidence: {
      attendance_pct: 91,
      weak_subject: "Mathematics",
      weak_subject_avg: 84,
      pending_assignments: 0,
      trend: "Stable",
      trend_detail: "Maintains steady grades and consistent attendance above 90% throughout term."
    },
    recommendation: "Maintain regular academic progress tracking."
  }
];

export const mockCourses: Course[] = [
  {
    course_id: "crs-301",
    course_code: "MATH-301",
    title: "Advanced Mathematics & Calculus",
    department: "Mathematics",
    assigned_classes: ["Grade 11-A", "Grade 11-B"],
    schedule: "Mon, Wed, Fri (09:00 AM - 10:30 AM)",
    total_students: 54,
    average_attendance_pct: 82,
    syllabus_progress_pct: 68
  },
  {
    course_id: "crs-201",
    course_code: "CS-201",
    title: "Data Structures & Algorithms",
    department: "Computer Science",
    assigned_classes: ["Grade 12-CS"],
    schedule: "Tue, Thu (11:00 AM - 12:30 PM)",
    total_students: 28,
    average_attendance_pct: 78,
    syllabus_progress_pct: 74
  },
  {
    course_id: "crs-202",
    course_code: "MATH-202",
    title: "Linear Algebra & Vector Calculus",
    department: "Mathematics",
    assigned_classes: ["Grade 12-CS", "Grade 11-A"],
    schedule: "Mon, Thu (02:00 PM - 03:30 PM)",
    total_students: 42,
    average_attendance_pct: 86,
    syllabus_progress_pct: 60
  }
];

export const mockClasses: ClassGroup[] = [
  {
    class_id: "cls-11a",
    name: "Grade 11-A",
    grade_level: "Grade 11",
    section: "A",
    course_id: "crs-301",
    course_name: "Advanced Mathematics",
    student_count: 28,
    class_average_pct: 74,
    attendance_today_marked: true,
    at_risk_count: 2
  },
  {
    class_id: "cls-11b",
    name: "Grade 11-B",
    grade_level: "Grade 11",
    section: "B",
    course_id: "crs-301",
    course_name: "Advanced Mathematics",
    student_count: 26,
    class_average_pct: 79,
    attendance_today_marked: false,
    at_risk_count: 1
  },
  {
    class_id: "cls-12cs",
    name: "Grade 12-CS",
    grade_level: "Grade 12",
    section: "CS",
    course_id: "crs-201",
    course_name: "Data Structures & Algorithms",
    student_count: 28,
    class_average_pct: 71,
    attendance_today_marked: false,
    at_risk_count: 3
  }
];

export const mockStudents: Student[] = [
  {
    student_id: "std-001",
    roll_number: "11A-01",
    name: "Arun Kumar",
    email: "arun.kumar@student.edu",
    class_id: "cls-11a",
    class_name: "Grade 11-A",
    overall_attendance_pct: 62,
    gpa_average: 2.4,
    at_risk: true,
    risk_level: "HIGH",
    risk_score: 82
  },
  {
    student_id: "std-002",
    roll_number: "12CS-04",
    name: "Rohan Gupta",
    email: "rohan.gupta@student.edu",
    class_id: "cls-12cs",
    class_name: "Grade 12-CS",
    overall_attendance_pct: 58,
    gpa_average: 2.1,
    at_risk: true,
    risk_level: "HIGH",
    risk_score: 78
  },
  {
    student_id: "std-003",
    roll_number: "12CS-09",
    name: "Ananya Patel",
    email: "ananya.patel@student.edu",
    class_id: "cls-12cs",
    class_name: "Grade 12-CS",
    overall_attendance_pct: 74,
    gpa_average: 2.9,
    at_risk: true,
    risk_level: "MEDIUM",
    risk_score: 56
  },
  {
    student_id: "std-004",
    roll_number: "11B-05",
    name: "Rahul Verma",
    email: "rahul.verma@student.edu",
    class_id: "cls-11b",
    class_name: "Grade 11-B",
    overall_attendance_pct: 72,
    gpa_average: 3.0,
    at_risk: true,
    risk_level: "MEDIUM",
    risk_score: 52
  },
  {
    student_id: "std-005",
    roll_number: "11A-12",
    name: "Priya Sharma",
    email: "priya.sharma@student.edu",
    class_id: "cls-11a",
    class_name: "Grade 11-A",
    overall_attendance_pct: 94,
    gpa_average: 3.9,
    at_risk: false,
    risk_level: "LOW",
    risk_score: 18
  },
  {
    student_id: "std-006",
    roll_number: "11A-18",
    name: "Vikram Singh",
    email: "vikram.singh@student.edu",
    class_id: "cls-11a",
    class_name: "Grade 11-A",
    overall_attendance_pct: 91,
    gpa_average: 3.7,
    at_risk: false,
    risk_level: "LOW",
    risk_score: 22
  },
  {
    student_id: "std-007",
    roll_number: "11B-14",
    name: "Sneha Roy",
    email: "sneha.roy@student.edu",
    class_id: "cls-11b",
    class_name: "Grade 11-B",
    overall_attendance_pct: 88,
    gpa_average: 3.5,
    at_risk: false,
    risk_level: "LOW",
    risk_score: 25
  },
  {
    student_id: "std-008",
    roll_number: "12CS-15",
    name: "Kavya Nair",
    email: "kavya.nair@student.edu",
    class_id: "cls-12cs",
    class_name: "Grade 12-CS",
    overall_attendance_pct: 86,
    gpa_average: 3.4,
    at_risk: false,
    risk_level: "LOW",
    risk_score: 28
  }
];

export const mockAssignments: Assignment[] = [
  {
    assignment_id: "asg-101",
    title: "Calculus Problem Set #4 — Integration Techniques",
    description: "Solve problems 1 through 15 on definite integration, integration by parts, and trigonometric substitution.",
    course_id: "crs-301",
    course_name: "Advanced Mathematics & Calculus",
    class_id: "cls-11a",
    class_name: "Grade 11-A",
    due_date: "2026-08-20",
    total_points: 100,
    submissions_count: 24,
    total_students: 28,
    evaluated_count: 18,
    status: "ACTIVE"
  },
  {
    assignment_id: "asg-102",
    title: "Data Structures Lab #3 — Binary Search Trees",
    description: "Implement BST insert, delete, and in-order traversal with memory optimization in C++ or Java.",
    course_id: "crs-201",
    course_name: "Data Structures & Algorithms",
    class_id: "cls-12cs",
    class_name: "Grade 12-CS",
    due_date: "2026-08-18",
    total_points: 50,
    submissions_count: 22,
    total_students: 28,
    evaluated_count: 10,
    status: "ACTIVE"
  },
  {
    assignment_id: "asg-103",
    title: "Linear Algebra Worksheet — Vector Subspaces",
    description: "Determine whether given subsets form vector subspaces and calculate dimension and basis.",
    course_id: "crs-202",
    course_name: "Linear Algebra & Vector Calculus",
    class_id: "cls-11b",
    class_name: "Grade 11-B",
    due_date: "2026-08-14",
    total_points: 50,
    submissions_count: 26,
    total_students: 26,
    evaluated_count: 26,
    status: "EVALUATED"
  }
];

export const mockSubmissions: AssignmentSubmission[] = [
  {
    submission_id: "sub-001",
    assignment_id: "asg-101",
    student_id: "std-001",
    student_name: "Arun Kumar",
    submitted_at: "2026-08-16 10:15",
    content_text: "Attached solution file for Integration Techniques.",
    file_attachment: "arun_calculus_ps4.pdf",
    marks_obtained: 48,
    max_marks: 100,
    feedback: "Several fundamental mistakes in integration by parts steps. Need to review core formulas.",
    status: "GRADED"
  },
  {
    submission_id: "sub-002",
    assignment_id: "asg-101",
    student_id: "std-005",
    student_name: "Priya Sharma",
    submitted_at: "2026-08-15 18:30",
    content_text: "Calculus PS4 completed with step-by-step proofs.",
    file_attachment: "priya_calculus_ps4.pdf",
    marks_obtained: 96,
    max_marks: 100,
    feedback: "Excellent work! Clear step-by-step solution and neat presentation.",
    status: "GRADED"
  },
  {
    submission_id: "sub-003",
    assignment_id: "asg-101",
    student_id: "std-006",
    student_name: "Vikram Singh",
    submitted_at: "2026-08-16 08:45",
    content_text: "Completed solutions for questions 1-15.",
    file_attachment: "vikram_calculus.pdf",
    max_marks: 100,
    status: "SUBMITTED"
  }
];

export const mockExaminations: Examination[] = [
  {
    exam_id: "exm-201",
    title: "Midterm Examination — Advanced Calculus",
    exam_type: "MIDTERM",
    course_id: "crs-301",
    course_name: "Advanced Mathematics",
    class_id: "cls-11a",
    class_name: "Grade 11-A",
    exam_date: "2026-08-25",
    max_marks: 100,
    weightage_pct: 30,
    marks_entered_count: 0,
    total_students: 28,
    status: "SCHEDULED"
  },
  {
    exam_id: "exm-202",
    title: "Unit Quiz 2 — Data Structures & Arrays",
    exam_type: "QUIZ",
    course_id: "crs-201",
    course_name: "Data Structures & Algorithms",
    class_id: "cls-12cs",
    class_name: "Grade 12-CS",
    exam_date: "2026-08-12",
    max_marks: 50,
    weightage_pct: 10,
    marks_entered_count: 28,
    total_students: 28,
    status: "COMPLETED"
  },
  {
    exam_id: "exm-203",
    title: "Unit Test 1 — Matrix Algebra",
    exam_type: "UNIT_TEST",
    course_id: "crs-202",
    course_name: "Linear Algebra",
    class_id: "cls-11b",
    class_name: "Grade 11-B",
    exam_date: "2026-08-10",
    max_marks: 50,
    weightage_pct: 15,
    marks_entered_count: 18,
    total_students: 26,
    status: "MARKS_PENDING"
  }
];

export const mockExamMarkEntries: ExamMarkEntry[] = [
  { student_id: "std-001", student_name: "Arun Kumar", roll_number: "11A-01", marks_obtained: 19, max_marks: 50, is_absent: false, remarks: "Needs improvement in matrix determinants." },
  { student_id: "std-005", student_name: "Priya Sharma", roll_number: "11A-12", marks_obtained: 47, max_marks: 50, is_absent: false, remarks: "Outstanding performance." },
  { student_id: "std-006", student_name: "Vikram Singh", roll_number: "11A-18", marks_obtained: 42, max_marks: 50, is_absent: false },
  { student_id: "std-007", student_name: "Sneha Roy", roll_number: "11B-14", marks_obtained: 38, max_marks: 50, is_absent: false },
  { student_id: "std-004", student_name: "Rahul Verma", roll_number: "11B-05", marks_obtained: null, max_marks: 50, is_absent: true, remarks: "Medical sick leave noted." }
];
