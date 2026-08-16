import React from 'react';
import { Navigate } from 'react-router-dom';

// The Staff portal no longer has its own login form.
// Authentication is handled centrally at http://localhost:5173/login
// Visiting /login here redirects straight to the centralised login.
export const AuthPage: React.FC = () => {
  React.useEffect(() => {
    window.location.href = 'http://localhost:5173/login';
  }, []);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0e0a',
      color: '#c9c3b2',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14
    }}>
      Redirecting to Campus Portal…
    </div>
  );
};
