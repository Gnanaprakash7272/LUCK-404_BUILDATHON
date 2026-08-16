import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { aiService } from '../services/aiService';
import { examService } from '../services/examService';
import { ClassGroup, Student, Examination, ExamMarkEntry } from '../types/academic';
import { AtRiskStudent } from '../types/ai';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  BarChart2,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EnrichedClassData {
  class_id: string;
  name: string;
  course_title: string;
  category: string;
  schedule: string;
  student_count: number;
  students: Student[];
  class_average_pct: number | null;
  attendance_rate: number | null;
  at_risk_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

export const AnalyticsPage: React.FC = () => {
  const [classesData, setClassesData] = useState<EnrichedClassData[]>([]);
  const [aiStudents, setAiStudents] = useState<AtRiskStudent[]>([]);
  const [selectedDrilldownClass, setSelectedDrilldownClass] = useState<EnrichedClassData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);
      setError(null);

      try {
        const [rawClasses, rawExams, aiList] = await Promise.all([
          teacherService.getClasses(),
          examService.getExams().catch(() => [] as Examination[]),
          aiService.getAtRiskStudents().catch(() => [] as AtRiskStudent[])
        ]);

        setAiStudents(aiList);

        // For each exam, fetch marks to compute real class exam averages
        const examMarksByClass: Record<string, { totalEarned: number; totalPossible: number }> = {};
        await Promise.all(
          rawExams.map(async (exm) => {
            const exmId = String(exm.id || exm.exam_id);
            const cId = String(exm.class_id);
            try {
              const marks = await examService.getExamMarks(exmId);
              const max = exm.max_marks || 100;
              if (!examMarksByClass[cId]) {
                examMarksByClass[cId] = { totalEarned: 0, totalPossible: 0 };
              }
              marks.forEach(m => {
                const val = m.marks_obtained !== undefined ? m.marks_obtained : (m as any).marks;
                if (val !== null && val !== undefined && !m.is_absent) {
                  examMarksByClass[cId].totalEarned += Number(val);
                  examMarksByClass[cId].totalPossible += Number(max);
                }
              });
            } catch {
              // Ignore individual exam mark fetch failures safely
            }
          })
        );

        // For each class, fetch students & compute attendance and risk counts
        const enrichedList: EnrichedClassData[] = await Promise.all(
          rawClasses.map(async (cls) => {
            const cId = String(cls.id || cls.class_id);
            let classStudents: Student[] = [];
            try {
              const stds = await teacherService.getClassStudents(cId);
              classStudents = stds.map(s => ({
                ...s,
                student_id: String(s.id || s.student_id),
                name: s.name || s.student_name || 'Student',
                class_id: cId,
                class_name: cls.course_title || cls.name || `Class ${cId}`
              }));
            } catch {
              classStudents = [];
            }

            // Real attendance average across enrolled students who have AI risk evidence
            let attendanceSum = 0;
            let attendanceCount = 0;
            let atRiskCount = 0;
            let highCount = 0;
            let medCount = 0;
            let lowCount = 0;

            classStudents.forEach(st => {
              const ai = aiList.find(a => String(a.student_id) === String(st.student_id));
              if (ai) {
                if (ai.risk_level === 'HIGH') {
                  atRiskCount++;
                  highCount++;
                } else if (ai.risk_level === 'MEDIUM') {
                  atRiskCount++;
                  medCount++;
                } else {
                  lowCount++;
                }

                if (ai.evidence?.attendance_pct !== undefined) {
                  attendanceSum += ai.evidence.attendance_pct;
                  attendanceCount++;
                }
              }
            });

            const attendanceRate = attendanceCount > 0 ? Math.round(attendanceSum / attendanceCount) : null;

            // Real exam average
            let classAvgPct: number | null = null;
            if (examMarksByClass[cId] && examMarksByClass[cId].totalPossible > 0) {
              classAvgPct = Math.round((examMarksByClass[cId].totalEarned / examMarksByClass[cId].totalPossible) * 100);
            }

            return {
              class_id: cId,
              name: cls.course_title || cls.name || `Class ${cId}`,
              course_title: cls.course_title || cls.name || 'Assigned Course',
              category: cls.category || 'Core Academic',
              schedule: cls.schedule || 'Schedule Not Assigned',
              student_count: classStudents.length || cls.enrolled_count || 0,
              students: classStudents,
              class_average_pct: classAvgPct,
              attendance_rate: attendanceRate,
              at_risk_count: atRiskCount,
              high_risk_count: highCount,
              medium_risk_count: medCount,
              low_risk_count: lowCount
            };
          })
        );

        setClassesData(enrichedList);
      } catch (err: any) {
        setError(err.message || 'Failed to load faculty analytics data.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, []);

  const handleOpenDrilldown = (cls: EnrichedClassData) => {
    setSelectedDrilldownClass(cls);
    setIsModalOpen(true);
  };

  // Recharts live dataset
  const comparisonChartData = classesData.map(cls => ({
    name: cls.name.length > 18 ? `${cls.name.substring(0, 16)}...` : cls.name,
    fullName: cls.name,
    class_average: cls.class_average_pct !== null ? cls.class_average_pct : 0,
    attendance_rate: cls.attendance_rate !== null ? cls.attendance_rate : 0,
    has_average: cls.class_average_pct !== null,
    has_attendance: cls.attendance_rate !== null,
    at_risk_count: cls.at_risk_count
  }));

  // Overall KPI statistics
  const totalClasses = classesData.length;
  const totalStudents = classesData.reduce((acc, c) => acc + c.student_count, 0);
  const totalAtRisk = aiStudents.filter(a => a.risk_level === 'HIGH' || a.risk_level === 'MEDIUM').length;

  const validAverages = classesData.filter(c => c.class_average_pct !== null).map(c => c.class_average_pct as number);
  const overallAvgScore = validAverages.length > 0
    ? `${Math.round(validAverages.reduce((a, b) => a + b, 0) / validAverages.length)}%`
    : '—';

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner label="Loading faculty academic analytics..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Class Performance & Academic Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time comparative metrics derived from verified class records, exam marks, and AI risk signals
          </p>
        </div>
      </div>

      {/* Top High-Level KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Classes</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Active teaching sections</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Enrolled across classes</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">At-Risk Students</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{totalAtRisk}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Require proactive follow-up</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Exam Avg</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{overallAvgScore}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Across evaluated exams</span>
        </div>
      </div>

      {/* Class Comparison Grid Cards */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Assigned Class Sections</h2>
        {classesData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No classes assigned yet</h3>
            <p className="text-xs text-slate-500 mt-1">Class assignments will appear here once registered by admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classesData.map((cls) => (
              <div
                key={cls.class_id}
                onClick={() => handleOpenDrilldown(cls)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
                    <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{cls.category} &bull; {cls.schedule}</p>

                  <div className="space-y-2.5 text-xs">
                    {/* Clickable Class Average Metric */}
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between hover:bg-indigo-100/80 transition-colors">
                      <span className="text-indigo-900 font-bold">Class Exam Average</span>
                      <span className="font-extrabold text-indigo-700 text-base">
                        {cls.class_average_pct !== null ? `${cls.class_average_pct}%` : '—'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600">Enrolled Students</span>
                      <span className="font-bold text-slate-900">{cls.student_count}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600">Attendance Rate</span>
                      <span className="font-bold text-slate-900">
                        {cls.attendance_rate !== null ? `${cls.attendance_rate}%` : '—'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600">AI Risk Count</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-xs ${
                          cls.at_risk_count > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {cls.at_risk_count} Students
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-bold">
                  <span>Click to view detailed class roster</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparative Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Comparative Class Performance vs Attendance
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Live comparison across assigned classes from database records
        </p>

        {comparisonChartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-medium">
            No class data available for comparative chart
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value: any, name: any, item: any) => {
                    if (name === 'Class Exam Avg (%)') {
                      return [item.payload.has_average ? `${value}%` : '— (No marks)', name];
                    }
                    if (name === 'Attendance Rate (%)') {
                      return [item.payload.has_attendance ? `${value}%` : '— (No attendance)', name];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="class_average" name="Class Exam Avg (%)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="attendance_rate" name="Attendance Rate (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Class Drill-Down Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Class Performance Drill-Down — ${selectedDrilldownClass?.name}`}
        subtitle={`Live performance metrics and student roster for ${selectedDrilldownClass?.course_title}`}
        maxWidth="2xl"
      >
        {selectedDrilldownClass && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center">
                <span className="text-indigo-700 font-bold block text-[11px]">Class Exam Avg</span>
                <span className="text-xl font-extrabold text-indigo-900 mt-0.5 block">
                  {selectedDrilldownClass.class_average_pct !== null ? `${selectedDrilldownClass.class_average_pct}%` : '—'}
                </span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                <span className="text-emerald-700 font-bold block text-[11px]">Attendance Rate</span>
                <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
                  {selectedDrilldownClass.attendance_rate !== null ? `${selectedDrilldownClass.attendance_rate}%` : '—'}
                </span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                <span className="text-amber-700 font-bold block text-[11px]">At-Risk Students</span>
                <span className="text-xl font-extrabold text-amber-900 mt-0.5 block">
                  {selectedDrilldownClass.at_risk_count}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1.5">Class Information</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Course Title</span>
                  <span className="font-semibold">{selectedDrilldownClass.course_title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Schedule</span>
                  <span className="font-semibold">{selectedDrilldownClass.schedule}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
                Enrolled Student Roster ({selectedDrilldownClass.students.length})
              </h4>
              {selectedDrilldownClass.students.length === 0 ? (
                <div className="p-6 text-center border border-slate-200 rounded-xl text-slate-400">
                  No students currently enrolled in this class section.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {selectedDrilldownClass.students.map(s => {
                    const ai = aiStudents.find(a => String(a.student_id) === String(s.student_id));
                    const attVal = ai?.evidence?.attendance_pct !== undefined ? `${ai.evidence.attendance_pct}%` : '—';
                    const riskTier = ai ? ai.risk_level : 'LOW';

                    return (
                      <div key={s.student_id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <span className="text-slate-400 text-[11px] ml-2">Roll: {s.roll_number}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700">Attendance: {attVal}</span>
                          <RiskBadge level={riskTier} score={ai?.risk_score} showScore size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

