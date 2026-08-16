import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { teacherService } from '../services/teacherService';
import { Course, ClassGroup } from '../types/academic';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { ArrowLeft, BookOpen, Clock, Users, Award, CalendarCheck, FileCheck2 } from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([teacherService.getCourses(), teacherService.getClasses()])
      .then(([crsList, clsList]) => {
        const found = crsList.find(c => c.course_id === id) || crsList[0];
        setCourse(found);
        setClasses(clsList.filter(c => c.course_id === found.course_id));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><LoadingSpinner label="Loading course details..." /></Layout>;
  if (error || !course) return <Layout><ErrorState message={error || 'Course not found'} /></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Courses
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
              {course.course_code}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{course.title}</h1>
            <p className="text-xs text-slate-500 mt-1">{course.department} &bull; Schedule: {course.schedule}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/attendance')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              Take Attendance
            </button>
            <button
              onClick={() => navigate('/assignments/create')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              Create Assignment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Total Enrolled Students</span>
            <span className="text-2xl font-bold text-slate-900 block mt-1">{course.total_students}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Average Attendance Rate</span>
            <span className="text-2xl font-bold text-emerald-700 block mt-1">{course.average_attendance_pct}%</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Syllabus Completion</span>
            <span className="text-2xl font-bold text-indigo-700 block mt-1">{course.syllabus_progress_pct}%</span>
          </div>
        </div>
      </div>

      <h2 className="text-base font-bold text-slate-900 mb-4">Assigned Class Sections</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <div
            key={cls.class_id}
            onClick={() => navigate(`/classes/${cls.class_id}`)}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{cls.student_count} Students &bull; Avg Performance: {cls.class_average_pct}%</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">View Class &rarr;</span>
          </div>
        ))}
      </div>
    </Layout>
  );
};
