import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

/**
 * Wraps protected admin routes.
 * - While session is being restored from localStorage: renders a loading screen.
 * - If no valid admin session: redirects to the CENTRALISED login at :5173/login.
 * - If valid admin session: renders children via <Outlet />.
 */
const AdminProtectedRoute = () => {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-text-secondary text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the centralised login page (not admin's own /login)
    window.location.href = 'http://localhost:5173/login';
    return null;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
