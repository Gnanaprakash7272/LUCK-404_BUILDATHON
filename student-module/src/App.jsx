import { Routes, Route, Navigate } from 'react-router-dom'

// ============================================================
// LAYOUT & ROUTE PROTECTION
// ============================================================

import Layout from './components/layout/Layout'
import ProtectedRoute from './routes/ProtectedRoute'

// ============================================================
// AUTH
// ============================================================

import Login from './pages/Login'

// ============================================================
// DASHBOARD
// ============================================================

import Dashboard from './pages/Dashboard'

// ============================================================
// ACADEMIC MODULE
// ============================================================

import MyCourses from './pages/MyCourses'
import CourseCatalog from './pages/CourseCatalog'
import CourseDetails from './pages/CourseDetails'
import Assignments from './pages/Assignments'
import Attendance from './pages/Attendance'
import Grades from './pages/Grades'
import Progress from './pages/Progress'

// ============================================================
// AI / INTELLIGENCE
// ============================================================

import AIInsights from './pages/AIInsights'

// ============================================================
// PROFILE
// ============================================================

import Profile from './pages/Profile'

// ============================================================
// REPORT
// ============================================================

import PerformanceReport from './pages/PerformanceReport'

// ============================================================
// ERROR
// ============================================================

import NotFound from './pages/NotFound'


export default function App() {
  return (
    <Routes>

      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ======================================================
          PROTECTED STUDENT APPLICATION
          
          Everything inside this route requires authentication.
          Layout provides:
          - Sidebar
          - Navbar
          - Main content area
          ====================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        {/* ====================================================
            DASHBOARD
            ==================================================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ====================================================
            MY COURSES
            ==================================================== */}

        <Route
          path="/my-courses"
          element={<MyCourses />}
        />


        {/* ====================================================
            COURSE CATALOG
            ==================================================== */}

        <Route
          path="/courses"
          element={<CourseCatalog />}
        />


        {/* ====================================================
            COURSE DETAILS
            ==================================================== */}

        <Route
          path="/courses/:id"
          element={<CourseDetails />}
        />


        {/* ====================================================
            ASSIGNMENTS
            ==================================================== */}

        <Route
          path="/assignments"
          element={<Assignments />}
        />


        {/* ====================================================
            ATTENDANCE
            ==================================================== */}

        <Route
          path="/attendance"
          element={<Attendance />}
        />


        {/* ====================================================
            GRADES
            ==================================================== */}

        <Route
          path="/grades"
          element={<Grades />}
        />


        {/* ====================================================
            PROGRESS
            ==================================================== */}

        <Route
          path="/progress"
          element={<Progress />}
        />


        {/* ====================================================
            AI INSIGHTS
            ==================================================== */}

        <Route
          path="/ai-insights"
          element={<AIInsights />}
        />


        {/* ====================================================
            PROFILE
            ==================================================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>


      {/* ======================================================
          PERFORMANCE REPORT (standalone — no Layout/sidebar)
          ====================================================== */}

      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <PerformanceReport />
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          ROOT ROUTE

          When user opens:
          http://localhost:5173/

          Redirect to dashboard.
          ProtectedRoute will automatically redirect
          unauthenticated users to /login.
          ====================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* ======================================================
          404 FALLBACK
          ====================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  )
}