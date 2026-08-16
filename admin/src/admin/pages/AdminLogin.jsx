import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const AdminLogin = () => {
  const { login, user, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated → go straight to dashboard
  if (!isLoading && user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      // Surface clean messages — no stack traces
      if (err.message.includes('administrator')) {
        setError(err.message);
      } else if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network')) {
        setError('Cannot connect to server. Make sure the backend is running on port 3000.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-secondary/5" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg">
            <span className="material-symbols-outlined text-[28px] text-white">admin_panel_settings</span>
          </div>
          <h1 className="text-[28px] font-bold text-on-surface leading-tight">Academic Pulse</h1>
          <p className="text-text-secondary text-[15px] mt-1">Administrator Portal</p>
        </div>

        {/* Card */}
        <div className="bg-surface-white border border-border-subtle rounded-2xl shadow-lg overflow-hidden">
          {/* Card header strip */}
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

          <div className="p-8">
            <h2 className="text-[20px] font-semibold text-on-surface mb-1">Sign in</h2>
            <p className="text-text-secondary text-[14px] mb-6">Enter your admin credentials to continue.</p>

            {/* Error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-error-container border border-error/20 rounded-xl">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">error</span>
                <p className="text-[13px] text-error font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[13px] font-medium text-on-surface mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-xl text-[14px] text-on-surface
                               placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                               disabled:opacity-50 transition-all"
                    placeholder="admin@academicpulse.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[13px] font-medium text-on-surface mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    disabled={submitting}
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-xl text-[14px] text-on-surface
                               placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                               disabled:opacity-50 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !email || !password}
                className="w-full mt-2 py-2.5 px-4 bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold text-[15px]
                           rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-text-secondary mt-6">
          This portal is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
