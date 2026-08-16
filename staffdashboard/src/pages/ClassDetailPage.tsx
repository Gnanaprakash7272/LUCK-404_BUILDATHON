import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { examService } from '../services/examService';
import { ClassGroup, Student } from '../types/academic';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import {
  ArrowLeft,
  Users,
  CalendarCheck,
  BarChart2,
  Download,
  Info,
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface SubjectAverage {
  subject: string;
  avg: number;
  examCount: number;
}

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState<ClassGroup | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<SubjectAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Import modal — only to show "not available" message
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clsList, stdList] = await Promise.all([
          teacherService.getClasses(),
          teacherService.getClassStudents(id || '')
        ]);

        // Find the class by id param (id may be numeric string)
        const found = clsList.find(c =>
          String(c.id) === id || String(c.class_id) === id
        ) || clsList[0];
        setClassInfo(found || null);

        // Map backend response: backend returns { id, name, email, roll_number }
        const mappedStudents: Student[] = stdList.map((s: any) => ({
          student_id: String(s.id || s.student_id || s.user_id || ''),
          id: s.id,
          roll_number: s.roll_number || '—',
          name: s.name || s.student_name || '—',
          email: s.email || '—',
          class_id: id || '',
          class_name: found?.course_title || found?.name || '',
          overall_attendance_pct: 0,
          gpa_average: 0,
          at_risk: false,
          risk_level: undefined,
          risk_score: undefined
        }));
        setStudents(mappedStudents);

        // Build real subject averages: exams for this class → marks → group by exam
        const allExams = await examService.getExams().catch(() => []);
        const classExams = allExams.filter(e =>
          String(e.class_id) === id || String(e.id) === id
        );

        const examMarkArrays = await Promise.all(
          classExams.map(e =>
            examService.getExamMarks(String(e.id || e.exam_id)).catch(() => [])
          )
        );

        // Group by course_title → calculate average percentage
        const courseMap: Record<string, { totalEarned: number; totalMax: number; count: number }> = {};
        classExams.forEach((e, idx) => {
          const marks = examMarkArrays[idx];
          const validMarks = marks.filter(m => m.marks_obtained !== null && m.marks_obtained !== undefined);
          if (validMarks.length === 0 || !e.max_marks) return;

          const subject = e.course_title || e.course_name || e.title;
          if (!courseMap[subject]) courseMap[subject] = { totalEarned: 0, totalMax: 0, count: 0 };
          const sumMarks = validMarks.reduce((acc, m) => acc + (m.marks_obtained || 0), 0);
          courseMap[subject].totalEarned += sumMarks;
          courseMap[subject].totalMax += e.max_marks * validMarks.length;
          courseMap[subject].count++;
        });

        const derived: SubjectAverage[] = Object.entries(courseMap)
          .map(([subject, { totalEarned, totalMax, count }]) => ({
            subject,
            avg: totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0,
            examCount: count
          }));

        setSubjectAverages(derived);
      } catch (err: any) {
        setError(err.message || 'Failed to load class data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // CSV Export — from real roster data
  const handleExportCSV = () => {
    if (students.length === 0) return;
    let csv = `Student ID,Roll Number,Name,Email\n`;
    students.forEach(s => {
      csv += `${s.student_id},${s.roll_number},"${s.name}","${s.email}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Class_${id}_Roster.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Layout><LoadingSpinner label="Loading class roster..." /></Layout>;
  if (error || !classInfo) return <Layout><ErrorState message={error || 'Class not found'} /></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/classes')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Classes
      </button>

      {/* Class Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
              {classInfo.course_title || classInfo.name}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
              {classInfo.course_title || classInfo.course_name || classInfo.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {students.length} Enrolled Students · Schedule: {classInfo.schedule || 'Not specified'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real CSV Export */}
            <button
              onClick={handleExportCSV}
              disabled={students.length === 0}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV Roster</span>
            </button>

            {/* Bulk Import — opens honest unavailable notice */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Bulk Import</span>
            </button>

            <button
              onClick={() => navigate('/attendance')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject Averages Chart — real exam marks or empty state */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Subject Average Comparison (from entered exam marks)
          </h3>
        </div>

        {subjectAverages.length > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Bar dataKey="avg" name="Class Avg (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center gap-3 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              No exam marks have been entered for this class yet. Subject averages will appear after exam marks are recorded.
            </span>
          </div>
        )}
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Enrolled Student Roster</h2>
          <span className="text-xs text-slate-500 font-medium">Total: {students.length}</span>
        </div>

        {students.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">No students enrolled in this class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(st => (
                  <tr
                    key={st.student_id}
                    onClick={() => navigate(`/students/${st.student_id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{st.roll_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{st.email}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md transition-colors">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Import — Honest Unavailable Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Student Roster Import"
        subtitle="Enrollment management via CSV"
      >
        <div className="p-4 text-xs text-slate-700 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 mb-1">Bulk enrollment import is not yet available</p>
              <p className="text-amber-700 leading-relaxed">
                The backend does not currently expose an enrollment creation endpoint
                (<code className="bg-amber-100 px-1 rounded text-[11px]">POST /api/classes/:id/enroll</code>).
                CSV student records cannot be persisted until this API is implemented.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="font-bold text-slate-800 mb-2">What you can do now:</p>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex items-start gap-2">
                <Download className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                <span><strong>Export</strong> the current real roster as a CSV file</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Mark attendance and record grades for enrolled students</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
