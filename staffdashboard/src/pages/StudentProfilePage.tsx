import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { assignmentService } from '../services/assignmentService';
import { examService } from '../services/examService';
import { aiService } from '../services/aiService';
import { attendanceService, RawAttendanceRecord } from '../services/attendanceService';
import { AIRiskCard } from '../components/ai/AIRiskCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { AtRiskStudent } from '../types/ai';
import {
  ArrowLeft,
  CalendarCheck,
  FileCheck2,
  Award,
  BookOpen,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

// ── Derived shape (assembled from multiple endpoints) ───────────────────────
interface AssignmentResult {
  title: string;
  class_id: number | string;
  course_title: string;
  score: number | null;
  max_score: number;
  due_date: string;
}

interface ExamResult {
  title: string;
  class_id: number | string;
  course_title: string;
  marks: number | null;
  max_marks: number;
  exam_date: string;
}

interface SubjectAverage {
  subject: string;
  average: number | null; // null = no data
  dataPoints: number;
}

interface StudentProfileData {
  id: number | string;
  name: string;
  email: string;
  roll_number: string;
  aiRisk: AtRiskStudent | null;
  assignmentResults: AssignmentResult[];
  examResults: ExamResult[];
  subjectAverages: SubjectAverage[];
  attendanceSummary: {
    total: number;
    present: number;
    pct: number | null;
    recent: RawAttendanceRecord[];
  };
}

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentId = Number(id);

        // 1. Basic identity
        const basicProfile = await teacherService.getStudentAcademicProfile(id);
        // The backend profile endpoint returns { id, name, email, roll_number }
        const basic = basicProfile as unknown as { id: number; name: string; email: string; roll_number: string };

        // 2. AI risk (filter from all at-risk list)
        const allAtRisk = await aiService.getAtRiskStudents().catch(() => []);
        const aiRisk = allAtRisk.find(r => Number(r.student_id) === studentId) || null;

        // 3. Teacher's classes → attendance per class for this student
        const classes = await teacherService.getClasses();

        // Collect all attendance records for this student across all classes
        const attendanceArrays = await Promise.all(
          classes.map(cls => {
            const cId = String(cls.id || cls.class_id);
            return attendanceService.getAttendance(cId).catch(() => [] as RawAttendanceRecord[]);
          })
        );
        const allAttendance = attendanceArrays
          .flat()
          .filter(r => Number(r.student_id) === studentId);
        const totalPresent = allAttendance.filter(r => r.status?.toLowerCase() === 'present').length;
        const totalAbs = allAttendance.length;
        const attendancePct = totalAbs > 0 ? Math.round((totalPresent / totalAbs) * 100) : null;

        // Sort and take 10 most recent
        const recentAtt = [...allAttendance]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 10);

        // 4. Assignments → submissions → filter by student
        const assignments = await assignmentService.getAssignments().catch(() => []);
        const submissionArrays = await Promise.all(
          assignments.map(a => {
            const aId = String(a.id || a.assignment_id);
            return assignmentService.getSubmissions(aId).catch(() => []);
          })
        );

        const assignmentResults: AssignmentResult[] = assignments
          .map((a, idx) => {
            const subs = submissionArrays[idx];
            const mySub = subs.find(s => Number(s.student_id) === studentId);
            return {
              title: a.title,
              class_id: a.class_id,
              course_title: a.course_title || a.course_name || 'Course',
              score: mySub?.score ?? mySub?.marks_obtained ?? null,
              max_score: a.max_score || a.total_points || 100,
              due_date: a.due_date
            };
          })
          .filter(a => a.score !== null || true); // show all, even unsubmitted

        // 5. Exams → marks → filter by student
        const exams = await examService.getExams().catch(() => []);
        const examMarkArrays = await Promise.all(
          exams.map(e => {
            const eId = String(e.id || e.exam_id);
            return examService.getExamMarks(eId).catch(() => []);
          })
        );

        const examResults: ExamResult[] = exams.map((e, idx) => {
          const marks = examMarkArrays[idx];
          const myMark = marks.find(m => Number(m.student_id) === studentId);
          return {
            title: e.title,
            class_id: e.class_id,
            course_title: e.course_title || e.course_name || 'Course',
            marks: myMark?.marks_obtained ?? null,
            max_marks: e.max_marks,
            exam_date: e.exam_date
          };
        });

        // 6. Derive subject averages from exams grouped by course
        const subjectMap: Record<string, { total: number; max: number; count: number }> = {};
        examResults.forEach(er => {
          if (er.marks !== null && er.max_marks > 0) {
            if (!subjectMap[er.course_title]) subjectMap[er.course_title] = { total: 0, max: 0, count: 0 };
            subjectMap[er.course_title].total += er.marks;
            subjectMap[er.course_title].max += er.max_marks;
            subjectMap[er.course_title].count++;
          }
        });
        // Also fold in assignments
        assignmentResults.forEach(ar => {
          if (ar.score !== null && ar.max_score > 0) {
            if (!subjectMap[ar.course_title]) subjectMap[ar.course_title] = { total: 0, max: 0, count: 0 };
            subjectMap[ar.course_title].total += ar.score;
            subjectMap[ar.course_title].max += ar.max_score;
            subjectMap[ar.course_title].count++;
          }
        });

        const subjectAverages: SubjectAverage[] = Object.entries(subjectMap).map(([subject, { total, max, count }]) => ({
          subject,
          average: max > 0 ? Math.round((total / max) * 100) : null,
          dataPoints: count
        }));

        setProfileData({
          id: basic.id || studentId,
          name: basic.name || 'Unknown Student',
          email: basic.email || '—',
          roll_number: (basic as any).roll_number || '—',
          aiRisk,
          assignmentResults,
          examResults,
          subjectAverages,
          attendanceSummary: {
            total: totalAbs,
            present: totalPresent,
            pct: attendancePct,
            recent: recentAtt
          }
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // CSV Export — only real fields
  const handleExportCSV = () => {
    if (!profileData) return;
    const { name, roll_number, email, aiRisk, attendanceSummary, subjectAverages } = profileData;
    let csv = `Student Name,Roll Number,Email,Attendance %,Risk Level\n`;
    csv += `"${name}",${roll_number},${email},${attendanceSummary.pct ?? '—'},${aiRisk?.risk_level || 'Unknown'}\n\n`;
    csv += `Subject,Score Average (%)\n`;
    subjectAverages.forEach(s => {
      csv += `"${s.subject}",${s.average ?? '—'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Academic_Profile_${name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Layout><LoadingSpinner label="Assembling student academic profile from database..." /></Layout>;
  if (error || !profileData) return <Layout><ErrorState message={error || 'Student profile unavailable'} /></Layout>;

  const {
    name, email, roll_number, aiRisk,
    assignmentResults, examResults, subjectAverages, attendanceSummary
  } = profileData;

  const evaluatedAssignments = assignmentResults.filter(a => a.score !== null);
  const evaluatedExams = examResults.filter(e => e.marks !== null);

  // Chart data for subject averages (only subjects with data)
  const chartData = subjectAverages
    .filter(s => s.average !== null)
    .map(s => ({ subject: s.subject, average: s.average }));

  return (
    <Layout>
      <button
        onClick={() => navigate('/students')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Student Directory
      </button>

      {/* Student Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl border border-indigo-200">
            {name.charAt(0)}
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              Roll: {roll_number}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{name}</h1>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* AI Risk Card */}
      {aiRisk ? (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>AI Risk Breakdown & Intervention Plan</span>
          </h2>
          <AIRiskCard student={aiRisk} />
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>This student is not currently classified as at-risk by the AI engine, or their AI insight has not been generated yet.</span>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl font-black ${attendanceSummary.pct !== null ? (attendanceSummary.pct < 75 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-400'}`}>
            {attendanceSummary.pct !== null ? `${attendanceSummary.pct}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            {attendanceSummary.present}/{attendanceSummary.total} sessions
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignments Graded</span>
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{evaluatedAssignments.length}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">of {assignmentResults.length} total</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exams Recorded</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{evaluatedExams.length}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">of {examResults.length} total</span>
        </div>
      </div>

      {/* Subject Averages Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Subject Average Performance (from real exam & assignment marks)
            </h3>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Bar dataKey="average" name="Average Score (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6 flex items-center gap-3 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>No graded marks found yet for this student. Subject averages will appear once assignments or exams have been evaluated.</span>
        </div>
      )}

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Assignment Results */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assignment Results</h3>
          </div>

          {assignmentResults.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No assignments found for this student's enrolled classes.</p>
          ) : (
            <div className="space-y-2.5 text-xs max-h-72 overflow-y-auto">
              {assignmentResults.map((a, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">{a.title}</span>
                    <span className="text-slate-400 text-[11px]">{a.course_title} · Due {a.due_date}</span>
                  </div>
                  {a.score !== null ? (
                    <span className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] ${
                      (a.score / a.max_score) < 0.6
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {a.score}/{a.max_score}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px]">Pending</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam Results */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Exam Results</h3>
          </div>

          {examResults.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No exams found for this student's enrolled classes.</p>
          ) : (
            <div className="space-y-2.5 text-xs max-h-72 overflow-y-auto">
              {examResults.map((e, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">{e.title}</span>
                    <span className="text-slate-400 text-[11px]">{e.course_title} · {e.exam_date}</span>
                  </div>
                  {e.marks !== null ? (
                    <span className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] ${
                      (e.marks / e.max_marks) < 0.6
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {e.marks}/{e.max_marks}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px]">Not entered</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Attendance Log (Last 10 Sessions)
          </h3>
        </div>

        {attendanceSummary.recent.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No attendance records found for this student across your classes.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {attendanceSummary.recent.map((att, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                <span className="text-slate-500 font-medium text-[11px]">{att.date}</span>
                <div className="flex items-center gap-1">
                  {att.status?.toLowerCase() === 'present' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={`font-bold text-[11px] uppercase ${
                    att.status?.toLowerCase() === 'present' ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {att.status?.toUpperCase() || '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
