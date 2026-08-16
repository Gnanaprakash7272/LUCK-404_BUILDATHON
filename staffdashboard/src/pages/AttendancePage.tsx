import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { attendanceService } from '../services/attendanceService';
import { ClassGroup, Course, Student, AttendanceRecord } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Save, History, CheckCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([teacherService.getClasses(), teacherService.getCourses()])
      .then(([clsList, crsList]) => {
        setClasses(clsList);
        setCourses(crsList);
        if (clsList.length > 0) {
          setSelectedClassId(clsList[0].class_id);
          setSelectedCourseId(clsList[0].course_id);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Load students whenever selected class changes
  useEffect(() => {
    if (selectedClassId) {
      teacherService.getClassStudents(selectedClassId).then(stList => {
        setStudents(stList);
        const initialMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
        stList.forEach(s => {
          initialMap[s.student_id] = 'PRESENT'; // default all present
        });
        setAttendanceMap(initialMap);
      });
    }
  }, [selectedClassId]);

  const handleBulkAction = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    students.forEach(s => {
      updated[s.student_id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleToggleStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setError(null);

    const records: AttendanceRecord[] = Object.entries(attendanceMap).map(([student_id, status]) => ({
      student_id,
      status
    }));

    try {
      await attendanceService.recordAttendance({
        course_id: selectedCourseId,
        class_id: selectedClassId,
        date: selectedDate,
        records
      });

      setSuccessMsg(`Attendance successfully recorded for ${records.length} students!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit attendance.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner label="Loading attendance register..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  const presentCount = Object.values(attendanceMap).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(v => v === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter(v => v === 'LATE').length;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mark / Take Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quickly record daily class attendance and submit directly to academic registry</p>
        </div>
        <button
          onClick={() => navigate('/attendance/history')}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <History className="w-4 h-4 text-indigo-600" />
          <span>Attendance History Logs</span>
        </button>
      </div>

      {/* Selector Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Class Group
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const cls = classes.find(c => c.class_id === e.target.value);
                setSelectedClassId(e.target.value);
                if (cls) setSelectedCourseId(cls.course_id);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {classes.map(c => (
                <option key={c.class_id} value={c.class_id}>
                  {c.name} ({c.grade_level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {courses.map(crs => (
                <option key={crs.course_id} value={crs.course_id}>
                  {crs.course_code} — {crs.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Attendance Register & Bulk Toolbar */}
      <form onSubmit={handleSubmitAttendance} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Bulk action header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-slate-700">Summary:</span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              {presentCount} Present
            </span>
            <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
              {absentCount} Absent
            </span>
            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              {lateCount} Late
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkAction('PRESENT')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkAction('ABSENT')}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Overall Attendance</th>
                <th className="py-3 px-4 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => {
                const currentStatus = attendanceMap[st.student_id] || 'PRESENT';

                return (
                  <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{st.roll_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {st.name}
                      <span className="block text-[11px] font-normal text-slate-400">{st.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${st.overall_attendance_pct < 75 ? 'text-red-600' : 'text-slate-800'}`}>
                        {st.overall_attendance_pct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(st.student_id, 'PRESENT')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(st.student_id, 'ABSENT')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${
                            currentStatus === 'ABSENT'
                              ? 'bg-red-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(st.student_id, 'LATE')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Form Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Recording Attendance...' : 'Save & Submit Attendance'}</span>
          </button>
        </div>
      </form>
    </Layout>
  );
};
