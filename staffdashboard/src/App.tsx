import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';

import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ClassesPage } from './pages/ClassesPage';
import { ClassDetailPage } from './pages/ClassDetailPage';
import { AttendancePage } from './pages/AttendancePage';
import { AttendanceHistoryPage } from './pages/AttendanceHistoryPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { CreateAssignmentPage } from './pages/CreateAssignmentPage';
import { GradeSubmissionsPage } from './pages/GradeSubmissionsPage';
import { ExamsPage } from './pages/ExamsPage';
import { CreateExamPage } from './pages/CreateExamPage';
import { ExamMarksPage } from './pages/ExamMarksPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { SchedulePage } from './pages/SchedulePage';
import { GradebookPage } from './pages/GradebookPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

// ── Allowed roles for the Staff portal ────────────────────────────────────────
const TEACHER_ROLES = ['teacher', 'staff', 'faculty'];
const CENTRAL_LOGIN = 'http://localhost:5173/login'; // Centralised login

// ── Bootstrap token from URL params (cross-origin redirect from login portal) ──
(function bootstrapAuthFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('_ap_token');
  const user   = params.get('_ap_user');
  if (token && user) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user',  user);
    localStorage.setItem('teacher_profile', user);
    // Clean URL so token is not visible in the address bar
    const clean = window.location.pathname;
    window.history.replaceState({}, '', clean);
  }
})();

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('teacher_profile') || localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  // 1. No token → central login
  if (!token) {
    window.location.href = CENTRAL_LOGIN;
    return null;
  }

  // 2. Token present but wrong role → central login
  const role = (storedUser?.role || '').toLowerCase();
  if (storedUser && !TEACHER_ROLES.includes(role)) {
    window.location.href = CENTRAL_LOGIN;
    return null;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />

        <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
        <Route path="/classes/:id" element={<ProtectedRoute><ClassDetailPage /></ProtectedRoute>} />

        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/attendance/history" element={<ProtectedRoute><AttendanceHistoryPage /></ProtectedRoute>} />

        <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
        <Route path="/assignments/create" element={<ProtectedRoute><CreateAssignmentPage /></ProtectedRoute>} />
        <Route path="/assignments/:id/submissions" element={<ProtectedRoute><GradeSubmissionsPage /></ProtectedRoute>} />

        <Route path="/exams" element={<ProtectedRoute><ExamsPage /></ProtectedRoute>} />
        <Route path="/exams/create" element={<ProtectedRoute><CreateExamPage /></ProtectedRoute>} />
        <Route path="/exams/:id/marks" element={<ProtectedRoute><ExamMarksPage /></ProtectedRoute>} />

        <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />

        <Route path="/ai-insights" element={<ProtectedRoute><AIInsightsPage /></ProtectedRoute>} />

        {/* Section 11 Optional Utilities */}
        <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
        <Route path="/gradebook" element={<ProtectedRoute><GradebookPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
