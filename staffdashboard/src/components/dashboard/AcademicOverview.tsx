import React from 'react';
import { Course, ClassGroup, Assignment, Examination } from '../../types/academic';
import { mockActivityLogs } from '../../mock/mockData';
import { BookOpen, Users, CalendarCheck, FileCheck2, Award, Clock, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AcademicOverviewProps {
  courses: Course[];
  classes: ClassGroup[];
  assignments: Assignment[];
  exams: Examination[];
}

export const AcademicOverview: React.FC<AcademicOverviewProps> = ({
  courses,
  classes,
  assignments,
  exams
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 mb-6">
      {/* Course & Class Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Courses Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Courses</h3>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All ({courses.length}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.course_id}
                onClick={() => navigate(`/courses/${course.course_id}`)}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {course.course_code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{course.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{course.schedule}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">{course.total_students} Students</span>
                  <span className="text-[11px] text-slate-500 font-medium">{course.syllabus_progress_pct}% Syllabus</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Classes Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Classes</h3>
            </div>
            <button
              onClick={() => navigate('/classes')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Manage Classes ({classes.length}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.class_id}
                onClick={() => navigate(`/classes/${cls.class_id}`)}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{cls.name}</h4>
                  <p className="text-[11px] text-slate-500">{cls.course_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] px-2 py-0.5 font-bold rounded-md border ${
                    cls.attendance_today_marked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {cls.attendance_today_marked ? 'Attendance Done' : 'Pending Attendance'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments & Exams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment & Submission Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assignments & Submissions</h3>
            </div>
            <button
              onClick={() => navigate('/assignments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All Assignments &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.assignment_id}
                onClick={() => navigate(`/assignments/${asg.assignment_id}/submissions`)}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs">{asg.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span>{asg.class_name}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" /> Due: {asg.due_date}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 block">
                    {asg.submissions_count} / {asg.total_students} Submitted
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {asg.evaluated_count} Evaluated
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Examination Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Examinations Overview</h3>
            </div>
            <button
              onClick={() => navigate('/exams')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage Exams &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {exams.map((ex) => (
              <div
                key={ex.exam_id}
                onClick={() => navigate(`/exams/${ex.exam_id}/marks`)}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    {ex.exam_type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{ex.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Date: {ex.exam_date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-1 font-bold rounded-lg border inline-block ${
                    ex.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : ex.status === 'MARKS_PENDING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {ex.status === 'MARKS_PENDING' ? 'Enter Marks' : ex.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. Faculty Activity Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Faculty Activity Log</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {mockActivityLogs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-indigo-700">{log.action}</span>
                <span className="text-[10px] text-slate-400 font-normal">{log.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium truncate">{log.target}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
