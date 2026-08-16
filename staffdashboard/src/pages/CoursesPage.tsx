import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { Course } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { BookOpen, Users, Clock, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    teacherService.getCourses()
      .then(setCourses)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner label="Loading assigned courses..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} /></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Assigned Courses</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage academic syllabus, schedules, and class allocations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((crs) => (
          <div
            key={crs.course_id}
            onClick={() => navigate(`/courses/${crs.course_id}`)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                  {crs.course_code}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {crs.department}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{crs.title}</h3>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{crs.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{crs.total_students} Enrolled Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Classes: {crs.assigned_classes.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600">Syllabus Completion</span>
                <span className="text-indigo-600">{crs.syllabus_progress_pct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${crs.syllabus_progress_pct}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 pt-2">
                <span>View Course Details</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
