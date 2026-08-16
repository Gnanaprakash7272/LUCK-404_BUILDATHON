import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { ClassGroup } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Users, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    teacherService.getClasses()
      .then(setClasses)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner label="Loading assigned classes..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Classes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage class rosters, student counts, and class-level risk indicators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.class_id}
            onClick={() => navigate(`/classes/${cls.class_id}`)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                  {cls.grade_level} — Section {cls.section}
                </span>
                {cls.at_risk_count > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    {cls.at_risk_count} At Risk
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Stable
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{cls.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{cls.course_name}</p>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Enrolled Students</span>
                  <span className="font-bold text-sm text-slate-900">{cls.student_count}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Class Average</span>
                  <span className="font-bold text-sm text-indigo-700">{cls.class_average_pct}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                cls.attendance_today_marked
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {cls.attendance_today_marked ? 'Attendance Taken' : 'Attendance Pending'}
              </span>

              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                View Roster <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
