import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { ClassGroup } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Info,
  CalendarDays,
  CheckCircle2,
  Bookmark,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface ParsedScheduleSlot {
  class_id: string;
  course_title: string;
  category: string;
  raw_schedule: string;
  time_display: string;
  day: string;
  enrolled_count: number;
}

export const SchedulePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [viewMode, setViewMode] = useState<'WEEKLY_GRID' | 'CLASS_WISE'>('WEEKLY_GRID');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      setError(null);
      try {
        const clsList = await teacherService.getClasses();
        setClasses(clsList);
      } catch (err: any) {
        setError(err.message || 'Failed to load faculty schedule.');
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, []);

  // Parse raw classes.schedule string into structured weekly slots
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

  const daysMap: Record<string, typeof daysOfWeek[number]> = {
    mon: 'Monday', monday: 'Monday',
    tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
    wed: 'Wednesday', wednesday: 'Wednesday',
    thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
    fri: 'Friday', friday: 'Friday'
  };

  const slotsByDay: Record<string, ParsedScheduleSlot[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  const unparsedClasses: ClassGroup[] = [];

  classes.forEach(cls => {
    const raw = (cls.schedule || '').trim();
    if (!raw) {
      unparsedClasses.push(cls);
      return;
    }

    // Split "Mon/Wed 10:00 AM" into ["Mon/Wed", "10:00", "AM"]
    const parts = raw.split(/\s+/);
    if (parts.length < 2) {
      unparsedClasses.push(cls);
      return;
    }

    const dayToken = parts[0];
    const timeToken = parts.slice(1).join(' ');

    const daySubTokens = dayToken.split(/[/,-]+/).map(s => s.trim().toLowerCase());
    let matchedAny = false;

    daySubTokens.forEach(sub => {
      const fullDay = daysMap[sub];
      if (fullDay && slotsByDay[fullDay] !== undefined) {
        matchedAny = true;
        slotsByDay[fullDay].push({
          class_id: String(cls.id || cls.class_id),
          course_title: cls.course_title || cls.name || 'Assigned Course',
          category: cls.category || 'Core Academic',
          raw_schedule: raw,
          time_display: timeToken,
          day: fullDay,
          enrolled_count: cls.enrolled_count || cls.student_count || 0
        });
      }
    });

    if (!matchedAny) {
      unparsedClasses.push(cls);
    }
  });

  const totalSessions = Object.values(slotsByDay).reduce((acc, list) => acc + list.length, 0);
  const totalStudents = classes.reduce((acc, c) => acc + (c.enrolled_count || c.student_count || 0), 0);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner label="Loading faculty schedule from database..." />
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
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Faculty Timetable & Class Schedule</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly timetable synchronized in real-time from assigned course sections in the database
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('WEEKLY_GRID')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'WEEKLY_GRID'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Schedule Grid
          </button>

          <button
            onClick={() => setViewMode('CLASS_WISE')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'CLASS_WISE'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class-wise Directory
          </button>
        </div>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Classes</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{classes.length}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Active course sections</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Sessions</span>
            <CalendarDays className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalSessions}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Lectures & practical slots</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{totalStudents}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Across all schedule sessions</span>
        </div>
      </div>

      {/* Institutional Policy Notice */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl mb-6 flex items-start gap-3 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Real-time Academic Schedule Synchronization:</span> Class meeting hours, sections, and lecture slots are populated directly from verified database records. Substitute assignments and room adjustments are managed institutionally via the Administration Portal.
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No classes assigned</h3>
          <p className="text-xs text-slate-500 mt-1">You do not currently have assigned classes or schedule slots registered in the system.</p>
        </div>
      ) : viewMode === 'WEEKLY_GRID' ? (
        /* Weekly Schedule Grid (Monday - Friday) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {daysOfWeek.map(dayName => {
              const daySlots = slotsByDay[dayName] || [];

              return (
                <div key={dayName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{dayName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      daySlots.length > 0
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {daySlots.length} {daySlots.length === 1 ? 'Class' : 'Classes'}
                    </span>
                  </div>

                  <div className="p-3 space-y-3 flex-1">
                    {daySlots.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-center text-xs text-slate-400 font-medium">
                        No classes scheduled
                      </div>
                    ) : (
                      daySlots.map((slot, idx) => (
                        <div
                          key={`${slot.class_id}-${idx}`}
                          className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 mb-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{slot.time_display}</span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1.5">
                            {slot.course_title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-indigo-100/60">
                            <span className="font-medium px-1.5 py-0.5 bg-white rounded border border-slate-200">
                              {slot.category}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Users className="w-3 h-3 text-slate-400" />
                              {slot.enrolled_count} Students
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unparsed / Special Schedule Classes */}
          {unparsedClasses.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>Special / Other Schedule Offerings</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {unparsedClasses.map(cls => (
                  <div key={String(cls.id || cls.class_id)} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <h4 className="font-bold text-slate-900 mb-1">{cls.course_title || cls.name}</h4>
                    <p className="text-slate-600 mb-2 font-medium">Schedule: {cls.schedule || 'Schedule TBA'}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Category: {cls.category || 'Core'}</span>
                      <span className="font-semibold text-slate-800">{cls.enrolled_count || 0} Students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Class-wise Timetable View */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">Filter Class:</span>
              <button
                onClick={() => setSelectedClassId('ALL')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                  selectedClassId === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Classes
              </button>
              {classes.map(cls => {
                const cId = String(cls.id || cls.class_id);
                return (
                  <button
                    key={cId}
                    onClick={() => setSelectedClassId(cId)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                      selectedClassId === cId
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cls.course_title || cls.name || `Class ${cId}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Assigned Teaching Schedule Directory</h3>
              <span className="text-xs text-slate-500 font-medium">{classes.length} Class Section(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 border-r border-slate-200">Course / Subject</th>
                    <th className="py-3.5 px-4 border-r border-slate-200">Department / Category</th>
                    <th className="py-3.5 px-4 border-r border-slate-200">Official Schedule</th>
                    <th className="py-3.5 px-4 border-r border-slate-200 text-center">Enrolled Students</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes
                    .filter(c => selectedClassId === 'ALL' || String(c.id || c.class_id) === selectedClassId)
                    .map(cls => (
                      <tr key={String(cls.id || cls.class_id)} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-200">
                          {cls.course_title || cls.name}
                          <span className="block text-[11px] font-mono font-normal text-slate-400">Class ID: {cls.id || cls.class_id}</span>
                        </td>
                        <td className="py-3.5 px-4 border-r border-slate-200 font-medium text-slate-600">
                          {cls.category || 'Academic'}
                        </td>
                        <td className="py-3.5 px-4 border-r border-slate-200 font-semibold text-indigo-700">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{cls.schedule || 'Schedule Not Assigned'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 border-r border-slate-200 text-center font-bold text-slate-900">
                          {cls.enrolled_count || cls.student_count || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active Term</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

