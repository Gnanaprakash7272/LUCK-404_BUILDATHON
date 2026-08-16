import { AtRiskStudent } from './ai';

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar_url?: string;
  assigned_courses_count: number;
  assigned_classes_count: number;
}

export interface Course {
  course_id: string;
  course_code: string;
  title: string;
  department: string;
  assigned_classes: string[];
  schedule: string;
  total_students: number;
  average_attendance_pct: number;
  syllabus_progress_pct: number;
}

export interface ClassGroup {
  class_id: string;
  id?: number | string;
  name: string;
  grade_level: string;
  section: string;
  course_id: string;
  course_name: string;
  course_title?: string;
  schedule?: string;
  category?: string;
  student_count: number;
  enrolled_count?: number;
  class_average_pct: number;
  attendance_today_marked: boolean;
  at_risk_count: number;
}

export interface Student {
  student_id: string;
  id?: string | number;
  roll_number: string;
  name: string;
  student_name?: string;
  email: string;
  class_id: string;
  class_name: string;
  overall_attendance_pct: number;
  gpa_average: number;
  at_risk: boolean;
  risk_level?: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score?: number;
}

export interface AttendanceRecord {
  student_id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
}

export interface AttendancePayload {
  course_id?: string;
  class_id: string;
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface AttendanceResponseItem {
  student_id: string;
  student_name: string;
  roll_number: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  date: string;
}

export interface Assignment {
  assignment_id: string;
  id?: number | string;
  title: string;
  description: string;
  course_id: string;
  course_name: string;
  course_title?: string;
  class_id: string;
  class_name: string;
  due_date: string;
  total_points: number;
  max_score?: number;
  submissions_count: number;
  total_students: number;
  evaluated_count: number;
  status: 'ACTIVE' | 'UPCOMING' | 'EVALUATED';
}

export interface CreateAssignmentPayload {
  title: string;
  description: string;
  course_id: string;
  class_id: string;
  due_date: string;
  total_points: number;
}

export interface AssignmentSubmission {
  submission_id?: string;
  id?: number | string;
  assignment_id: string | number;
  student_id: string | number;
  student_name?: string;
  submitted_at?: string;
  submission_date?: string;
  content_text?: string;
  content_ref?: string;
  file_attachment?: string;
  marks_obtained?: number | null;
  score?: number | null;
  max_marks?: number;
  feedback?: string;
  status?: 'SUBMITTED' | 'GRADED' | 'LATE';
}

export interface GradePayload {
  student_id: string | number;
  score: number;
  feedback: string;
}

export interface Examination {
  exam_id: string;
  id?: number | string;
  title: string;
  exam_type: 'MIDTERM' | 'FINAL' | 'UNIT_TEST' | 'QUIZ';
  course_id: string;
  course_name: string;
  course_title?: string;
  class_id: string;
  class_name: string;
  exam_date: string;
  max_marks: number;
  weightage_pct: number;
  marks_entered_count: number;
  total_students: number;
  status: 'SCHEDULED' | 'MARKS_PENDING' | 'COMPLETED';
}

export interface CreateExamPayload {
  title: string;
  exam_type: 'MIDTERM' | 'FINAL' | 'UNIT_TEST' | 'QUIZ';
  course_id: string;
  class_id: string;
  exam_date: string;
  max_marks: number;
  weightage_pct: number;
}

export interface ExamMarkEntry {
  student_id: string;
  student_name: string;
  roll_number: string;
  marks_obtained: number | null;
  max_marks: number;
  is_absent: boolean;
  remarks?: string;
}

export interface PostExamMarksPayload {
  marks_records: {
    student_id: string | number;
    marks: number;
    is_absent?: boolean;
    remarks?: string;
  }[];
}

export interface StudentAcademicProfile {
  student: Student;
  ai_risk: AtRiskStudent | null;
  attendance_history: { date: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }[];
  assignment_results: { assignment_id: string; title: string; marks: number; max_marks: number; due_date: string }[];
  exam_results: { exam_id: string; title: string; marks: number; max_marks: number; exam_date: string }[];
  subject_averages: { subject: string; average: number }[];
}
