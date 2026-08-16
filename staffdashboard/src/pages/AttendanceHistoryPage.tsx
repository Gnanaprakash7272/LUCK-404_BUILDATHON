import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { attendanceService, RawAttendanceRecord } from '../services/attendanceService';
import { teacherService } from '../services/teacherService';
import { ClassGroup, Student } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Calendar, ArrowLeft, CalendarDays, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Heatmap cell derived from real attendance records
interface HeatmapDay {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  presentCount: number;
  totalCount: number;
  pct: number | null; // null = no records for that day
}

export const AttendanceHistoryPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [allRecords, setAllRecords] = useState<RawAttendanceRecord[]>([]);

  // The date the user clicks on in the heatmap to filter audit log
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Display month for heatmap — default: current month
  const now = new Date();
  const [heatmapYear, setHeatmapYear] = useState(now.getFullYear());
  const [heatmapMonth, setHeatmapMonth] = useState(now.getMonth()); // 0-indexed

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Load teacher's classes
  useEffect(() => {
    teacherService.getClasses()
      .then(clsList => {
        setClasses(clsList);
        if (clsList.length > 0) {
          const firstId = String(clsList[0].id || clsList[0].class_id);
          setSelectedClassId(firstId);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingClasses(false));
  }, []);

  // Load class students when class changes
  useEffect(() => {
    if (!selectedClassId) return;
    teacherService.getClassStudents(selectedClassId)
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [selectedClassId]);

  // Load ALL attendance records for selected class (no date filter → all history)
  useEffect(() => {
    if (!selectedClassId) return;
    setLoadingRecords(true);
    attendanceService.getAttendance(selectedClassId)
      .then(setAllRecords)
      .catch(err => setError(err.message))
      .finally(() => setLoadingRecords(false));
  }, [selectedClassId]);

  // Build a lookup: student_id → student info
  const studentMap = useMemo(() => {
    const m: Record<number, Student> = {};
    students.forEach(s => {
      const sid = Number(s.id || s.student_id);
      if (!isNaN(sid)) m[sid] = s;
    });
    return m;
  }, [students]);

  // Build heatmap from all records for the displayed month
  const heatmapDays = useMemo((): HeatmapDay[] => {
    const daysInMonth = new Date(heatmapYear, heatmapMonth + 1, 0).getDate();
    const days: HeatmapDay[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(heatmapMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${heatmapYear}-${mm}-${dd}`;

      const dayRecords = allRecords.filter(r => r.date === dateStr);
      const presentCount = dayRecords.filter(r =>
        r.status?.toLowerCase() === 'present'
      ).length;
      const totalCount = dayRecords.length;

      days.push({
        dateStr,
        dayNum: d,
        presentCount,
        totalCount,
        pct: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null
      });
    }
    return days;
  }, [allRecords, heatmapYear, heatmapMonth]);

  // Audit log: records for the selected date, joined with student info
  const auditLog = useMemo(() => {
    return allRecords
      .filter(r => r.date === selectedDate)
      .map(r => {
        const sid = Number(r.student_id);
        const stu = studentMap[sid];
        return {
          student_id: r.student_id,
          student_name: stu?.name || stu?.student_name || `Student #${r.student_id}`,
          roll_number: stu?.roll_number || '—',
          status: r.status?.toUpperCase() || '—',
          date: r.date
        };
      });
  }, [allRecords, selectedDate, studentMap]);

  // KPIs from all records
  const totalPresent = allRecords.filter(r => r.status?.toLowerCase() === 'present').length;
  const totalAbsent = allRecords.filter(r => r.status?.toLowerCase() === 'absent').length;
  const overallPct = allRecords.length > 0
    ? Math.round((totalPresent / allRecords.length) * 100)
    : null;

  // Heatmap month display
  const monthLabel = new Date(heatmapYear, heatmapMonth, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // First day of month (0=Sun, 1=Mon, ...)
  const monthStartDay = new Date(heatmapYear, heatmapMonth, 1).getDay();

  if (loadingClasses) return <Layout><LoadingSpinner label="Loading faculty classes..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} onRetry={() => window.location.reload()} /></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/attendance')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Mark Attendance
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance History & Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical attendance derived from real database records — click any day to view the detailed audit log
          </p>
        </div>

        {/* Class Selector */}
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
        >
          {classes.map(cls => {
            const cId = String(cls.id || cls.class_id);
            return (
              <option key={cId} value={cId}>
                {cls.course_title || cls.name} (Class {cId})
              </option>
            );
          })}
        </select>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</span>
            <CalendarDays className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl font-black ${overallPct !== null ? (overallPct >= 75 ? 'text-emerald-600' : 'text-red-600') : 'text-slate-400'}`}>
            {overallPct !== null ? `${overallPct}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            {allRecords.length} total records in database
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Present Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalPresent}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Marked present across all dates</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absent Sessions</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-500">{totalAbsent}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Marked absent across all dates</span>
        </div>
      </div>

      {/* Heatmap Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Attendance Heatmap — {monthLabel}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Month navigation */}
            <button
              onClick={() => {
                const d = new Date(heatmapYear, heatmapMonth - 1, 1);
                setHeatmapYear(d.getFullYear());
                setHeatmapMonth(d.getMonth());
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => {
                const d = new Date(heatmapYear, heatmapMonth + 1, 1);
                setHeatmapYear(d.getFullYear());
                setHeatmapMonth(d.getMonth());
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              Next ›
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold mb-3">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> High (&gt;80%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Medium (60–80%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Low (&lt;60%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> No records</span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="font-bold text-slate-400 py-1 text-[11px] uppercase">{d}</div>
          ))}

          {/* Blank offset for month start */}
          {Array.from({ length: monthStartDay }, (_, i) => (
            <div key={`blank-${i}`} className="h-14 rounded-xl bg-slate-50/50" />
          ))}

          {heatmapDays.map(day => {
            let colorClass = 'bg-slate-50 border-slate-100 text-slate-400 cursor-default';
            if (day.pct !== null) {
              if (day.pct >= 80) colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100 cursor-pointer';
              else if (day.pct >= 60) colorClass = 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 cursor-pointer';
              else colorClass = 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100 cursor-pointer';
            } else if (loadingRecords) {
              colorClass = 'bg-slate-100 border-slate-200 text-slate-400 animate-pulse';
            }

            const isSelected = selectedDate === day.dateStr;

            return (
              <div
                key={day.dayNum}
                onClick={() => day.pct !== null && setSelectedDate(day.dateStr)}
                className={`h-14 rounded-xl border p-1.5 transition-all flex flex-col justify-between text-left ${colorClass} ${
                  isSelected ? 'ring-2 ring-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                <span className="text-[11px] font-bold">{day.dayNum}</span>
                {day.pct !== null && (
                  <span className="text-[10px] font-extrabold block text-right">
                    {day.pct}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date picker for audit log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              View Audit Log for Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-4 sm:mt-6">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>
              {auditLog.length > 0
                ? `${auditLog.filter(r => r.status === 'PRESENT').length} present / ${auditLog.length} total for ${selectedDate}`
                : `No attendance records for ${selectedDate}`}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Recorded Audit Log — {selectedDate}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {loadingRecords ? 'Loading…' : `${auditLog.length} entries`}
          </span>
        </div>

        {loadingRecords ? (
          <div className="p-8 text-center">
            <LoadingSpinner label="Loading attendance records..." />
          </div>
        ) : auditLog.length === 0 ? (
          <div className="p-10 text-center">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              No attendance records found for {selectedDate}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Attendance may not have been marked for this class on this date.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Status Logged</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLog.map((rec, idx) => (
                  <tr key={`${rec.student_id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{rec.roll_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rec.student_name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rec.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};
