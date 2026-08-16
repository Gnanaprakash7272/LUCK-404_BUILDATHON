import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { aiService } from '../services/aiService';
import { Student } from '../types/academic';
import { AtRiskStudent } from '../types/ai';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { GraduationCap, Search, Filter, ChevronRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [aiStudents, setAiStudents] = useState<AtRiskStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadStudentsData() {
      setLoading(true);
      setError(null);
      try {
        const [classes, aiList] = await Promise.all([
          teacherService.getClasses(),
          aiService.getAtRiskStudents().catch(() => [] as AtRiskStudent[])
        ]);

        // Fetch students for all teacher classes
        const studentPromises = classes.map(async (cls) => {
          const classId = (cls as any).class_id || (cls as any).id;
          if (!classId) return [];
          const classStudents = await teacherService.getClassStudents(String(classId)).catch(() => [] as Student[]);
          return classStudents.map(st => ({
            ...st,
            student_id: String((st as any).id || (st as any).student_id || ''),
            name: st.name || (st as any).student_name || 'Student',
            class_id: String(classId),
            class_name: (cls as any).name || (cls as any).course_title || 'Assigned Class'
          }));
        });

        const nestedStudents = await Promise.all(studentPromises);
        const flattened = nestedStudents.flat();

        // Deduplicate students by student_id
        const uniqueMap = new Map<string, Student>();
        flattened.forEach(s => {
          if (s.student_id && !uniqueMap.has(s.student_id)) {
            uniqueMap.set(s.student_id, s);
          }
        });

        setStudents(Array.from(uniqueMap.values()));
        setAiStudents(aiList);
      } catch (err: any) {
        setError(err.message || 'Failed to load student directory.');
      } finally {
        setLoading(false);
      }
    }

    loadStudentsData();
  }, []);

  if (loading) return <Layout><LoadingSpinner label="Loading student directory..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  // Merge AI risk info into student object for accurate filtering
  const mergedStudents = students.map(s => {
    const ai = aiStudents.find(a => String(a.student_id) === String(s.student_id));
    return {
      ...s,
      risk_level: ai ? ai.risk_level : (s.risk_level || 'LOW'),
      risk_score: ai ? ai.risk_score : (s.risk_score || 0),
      overall_attendance_pct: (s as any).overall_attendance_pct ?? ai?.evidence?.attendance_pct ?? 100,
      gpa_average: (s as any).gpa_average ?? 3.8
    };
  });

  const filtered = mergedStudents.filter(s => {
    const name = (s.name || '').toLowerCase();
    const roll = (s.roll_number || '').toLowerCase();
    const className = (s.class_name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = name.includes(search) || roll.includes(search) || className.includes(search);
    const matchesRisk = riskFilter === 'ALL' || s.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Directory & Academic Monitoring</h1>
          <p className="text-xs text-slate-500 mt-0.5">Filter student roster by class section and backend AI risk tier</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name, roll number..."
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Risk:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setRiskFilter(tier)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                riskFilter === tier
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class Section</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">GPA / Academic Avg</th>
                <th className="py-3 px-4">AI Risk Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((st) => (
                <tr
                  key={st.student_id}
                  onClick={() => navigate(`/students/${st.student_id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{st.roll_number}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {st.name}
                    <span className="block text-[11px] font-normal text-slate-400">{st.email}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{st.class_name}</td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className={st.overall_attendance_pct < 75 ? 'text-red-600' : 'text-slate-800'}>
                      {st.overall_attendance_pct}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{st.gpa_average}</td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={st.risk_level || 'LOW'} score={st.risk_score} showScore size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200 transition-colors inline-flex items-center gap-1">
                      <span>Full Academic Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
