import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './admin/contexts/AdminAuthContext';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';

// Centralised login lives on the Student portal at :5173
const CentralLoginRedirect = () => {
  React.useEffect(() => {
    window.location.href = 'http://localhost:5173/login';
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#0f0e0a', color: '#c9c3b2', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
      Redirecting to Campus Portal…
    </div>
  );
};


import AdminDashboard from './admin/pages/AdminDashboard';
import Departments from './admin/pages/Departments';
import DepartmentDetails from './admin/pages/DepartmentDetails';
import Faculty from './admin/pages/Faculty';
import FacultyDetails from './admin/pages/FacultyDetails';
import Students from './admin/pages/Students';
import StudentDetails from './admin/pages/StudentDetails';
import Parents from './admin/pages/Parents';
import Subjects from './admin/pages/Subjects';
import Classes from './admin/pages/Classes';
import ClassDetails from './admin/pages/ClassDetails';
import Timetable from './admin/pages/Timetable';
import Rooms from './admin/pages/Rooms';
import Workload from './admin/pages/Workload';
import Attendance from './admin/pages/Attendance';
import Calendar from './admin/pages/Calendar';
import AcademicRecords from './admin/pages/AcademicRecords';
import Analytics from './admin/pages/Analytics';
import AIInsights from './admin/pages/AIInsights';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';
import Support from './admin/pages/Support';
import AccessManagement from './admin/pages/AccessManagement';
import AuditHistory from './admin/pages/AuditHistory';
import { ToastProvider } from './admin/contexts/ToastContext';
import StudentPortal from './student/StudentPortal';
import TeacherPortal from './teacher/TeacherPortal';

const App = () => {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <Routes>
          {/* Public — redirect /login to centralised portal */}
          <Route path="/login" element={<CentralLoginRedirect />} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* All /admin/* routes require a valid admin session */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />

              <Route path="departments" element={<Departments />} />
              <Route path="departments/:id" element={<DepartmentDetails />} />

              <Route path="faculty" element={<Faculty />} />
              <Route path="faculty/:id" element={<FacultyDetails />} />

              <Route path="students" element={<Students />} />
              <Route path="students/:id" element={<StudentDetails />} />

              <Route path="parents" element={<Parents />} />
              <Route path="subjects" element={<Subjects />} />

              <Route path="classes" element={<Classes />} />
              <Route path="classes/:id" element={<ClassDetails />} />

              <Route path="timetable" element={<Timetable />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="workload" element={<Workload />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="calendar" element={<Calendar />} />

              <Route path="academic-records" element={<AcademicRecords />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="insights" element={<AIInsights />} />
              <Route path="reports" element={<Reports />} />
              <Route path="access" element={<AccessManagement />} />
              <Route path="audit" element={<AuditHistory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Route>

          {/* Embedded portals (legacy routes, unchanged) */}
          <Route path="/student/*" element={<StudentPortal />} />
          <Route path="/teacher/*" element={<TeacherPortal />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AdminAuthProvider>
    </ToastProvider>
  );
};

export default App;
