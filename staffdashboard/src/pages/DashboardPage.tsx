import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { TeacherProfileCard } from '../components/dashboard/TeacherProfileCard';
import { StatCard } from '../components/common/StatCard';
import { AcademicOverview } from '../components/dashboard/AcademicOverview';
import { AtRiskSummaryTable } from '../components/dashboard/AtRiskSummaryTable';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { AIRiskDetailModal } from '../components/ai/AIRiskDetailModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';

import { teacherService } from '../services/teacherService';
import { aiService } from '../services/aiService';
import { assignmentService } from '../services/assignmentService';
import { examService } from '../services/examService';
import { mockAcademicCalendarEvents, AcademicCalendarEvent } from '../mock/mockData';

import { TeacherProfile, Course, ClassGroup, Assignment, Examination } from '../types/academic';
import { AtRiskStudent } from '../types/ai';
import { BookOpen, Users, CalendarCheck, FileCheck2, Award, Sparkles, Clock, Calendar, SlidersHorizontal, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 21. Dashboard Widget Customization State
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({
    courses: true,
    classes: true,
    grading: true,
    exams: true,
    attendance: true,
    atRisk: true,
  });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // 22. Academic Calendar Overlay State
  const [isCalendarOverlayOpen, setIsCalendarOverlayOpen] = useState(false);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profData, crsData, clsData, asgData, exmData, aiData] = await Promise.all([
        teacherService.getProfile(),
        teacherService.getCourses(),
        teacherService.getClasses(),
        assignmentService.getAssignments(),
        examService.getExams(),
        aiService.getAtRiskStudents(),
      ]);

      setProfile(profData);
      setCourses(crsData);
      setClasses(clsData);
      setAssignments(asgData);
      setExams(exmData);
      setAtRiskStudents(aiData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSelectStudent = (st: AtRiskStudent) => {
    setSelectedStudent(st);
    setIsModalOpen(true);
  };

  const toggleWidget = (key: string) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20">
          <LoadingSpinner label="Loading faculty workspace & AI risk intelligence..." size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <ErrorState onRetry={loadDashboardData} message={error || 'Failed to retrieve profile.'} />
      </Layout>
    );
  }

  const highRiskCount = atRiskStudents.filter(s => s.risk_level === 'HIGH').length;

  return (
    <Layout atRiskCount={atRiskStudents.length}>
      {/* Top Controls Toolbar (Dashboard Customizer & Academic Calendar Overlay) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-semibold tracking-tight text-ink">Dashboard</h2>
          <p className="text-sm text-ink-faint mt-1">Overview of your classes, students, and tasks</p>
        </div>

        <div className="flex items-center gap-3">
          {/* 22. Academic Calendar Overlay Button */}
          <button
            onClick={() => setIsCalendarOverlayOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft shadow-sm ring-1 ring-inset ring-surface-border hover:bg-surface-sunk hover:text-ink transition-colors"
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Calendar</span>
          </button>

          {/* 21. Widget Customization Button */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft shadow-sm ring-1 ring-inset ring-surface-border hover:bg-surface-sunk hover:text-ink transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-ink-faint" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Due-Date Reminder Banner */}
      <div className="bg-risk-mediumBg border border-risk-medium/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-risk-medium flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">Deadline Alert Reminder</span>
            <p className="text-sm font-semibold text-ink mt-0.5">
              Calculus PS#4 due in 4 days &bull; Unit Test 1 marks entry pending for Grade 11-B
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/assignments')}
            className="rounded-xl bg-risk-medium px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            Review Submissions
          </button>
          <button
            onClick={() => navigate('/exams')}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm ring-1 ring-inset ring-amber-200 hover:bg-amber-50 transition-colors"
          >
            Enter Marks
          </button>
        </div>
      </div>

      {/* Teacher Profile Banner */}
      <TeacherProfileCard profile={profile} />

      {/* 21. Summary KPI Cards with Customization toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {visibleWidgets.courses && (
          <StatCard
            title="My Courses"
            value={courses.length}
            subtitle="Active subjects"
            icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
            badgeText="Term Fall"
            badgeVariant="blue"
            onClick={() => navigate('/courses')}
          />
        )}

        {visibleWidgets.classes && (
          <StatCard
            title="My Classes"
            value={classes.length}
            subtitle="Class sections"
            icon={<Users className="w-5 h-5 text-blue-600" />}
            badgeText="110 Students"
            badgeVariant="blue"
            onClick={() => navigate('/classes')}
          />
        )}

        {visibleWidgets.grading && (
          <StatCard
            title="Pending Grading"
            value={assignments.reduce((acc, a) => acc + (a.submissions_count - a.evaluated_count), 0)}
            subtitle="Submissions queued"
            icon={<FileCheck2 className="w-5 h-5 text-amber-600" />}
            badgeText="Needs Action"
            badgeVariant="amber"
            onClick={() => navigate('/assignments')}
          />
        )}

        {visibleWidgets.exams && (
          <StatCard
            title="Upcoming Exams"
            value={exams.filter(e => e.status !== 'COMPLETED').length}
            subtitle="Next 14 days"
            icon={<Award className="w-5 h-5 text-purple-600" />}
            badgeText="Scheduled"
            badgeVariant="blue"
            onClick={() => navigate('/exams')}
          />
        )}

        {visibleWidgets.attendance && (
          <StatCard
            title="Today's Attendance"
            value={`${classes.filter(c => c.attendance_today_marked).length}/${classes.length}`}
            subtitle="Classes marked"
            icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
            badgeText="Daily Log"
            badgeVariant="green"
            onClick={() => navigate('/attendance')}
          />
        )}

        {visibleWidgets.atRisk && (
          <StatCard
            title="At-Risk Students"
            value={highRiskCount}
            subtitle="Immediate attention"
            icon={<Sparkles className="w-5 h-5 text-red-600" />}
            badgeText="AI Alert"
            badgeVariant="red"
            onClick={() => navigate('/ai-insights')}
          />
        )}
      </div>

      {/* AI Academic Intelligence Table */}
      <AtRiskSummaryTable
        students={atRiskStudents}
        onSelectStudent={handleSelectStudent}
        onViewAllAI={() => navigate('/ai-insights')}
      />

      {/* Performance Trend Chart */}
      <PerformanceChart />

      {/* Academic Overview (Courses, Classes, Assignments, Exams, Activity Log) */}
      <AcademicOverview
        courses={courses}
        classes={classes}
        assignments={assignments}
        exams={exams}
      />

      {/* AI Breakdown Detail Modal */}
      <AIRiskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onNavigateToProfile={(id) => navigate(`/students/${id}`)}
      />

      {/* 21. Widget Customizer Modal */}
      <Modal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        title="Dashboard Summary Cards Customization"
        subtitle="Toggle summary KPI cards to customize your home dashboard layout"
      >
        <div className="space-y-3 text-xs">
          {[
            { key: 'courses', label: 'My Courses Card' },
            { key: 'classes', label: 'My Classes Card' },
            { key: 'grading', label: 'Pending Grading Submissions' },
            { key: 'exams', label: 'Upcoming Examinations Card' },
            { key: 'attendance', label: "Today's Attendance Activity" },
            { key: 'atRisk', label: 'AI At-Risk Students Count Card' },
          ].map(w => (
            <label key={w.key} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <span className="font-bold text-slate-900">{w.label}</span>
              <input
                type="checkbox"
                checked={visibleWidgets[w.key]}
                onChange={() => toggleWidget(w.key)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>
      </Modal>

      {/* 22. Academic Calendar Overlay Modal */}
      <Modal
        isOpen={isCalendarOverlayOpen}
        onClose={() => setIsCalendarOverlayOpen(false)}
        title="Academic Calendar Overlay — Integrated View"
        subtitle="Combined schedule of upcoming exam dates, assignment due dates, and faculty meetings"
      >
        <div className="space-y-3 text-xs">
          {mockAcademicCalendarEvents.map(evt => (
            <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{evt.title}</span>
                <span className="text-slate-500 font-mono text-[11px]">Date: {evt.date}</span>
              </div>
              <span className={`px-2.5 py-1 font-bold rounded-lg text-[10px] ${
                evt.type === 'EXAM'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : evt.type === 'ASSIGNMENT_DUE'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {evt.type}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};
