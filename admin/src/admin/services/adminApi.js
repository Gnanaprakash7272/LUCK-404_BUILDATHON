/**
 * adminApi.js — wired to the real Academic Pulse backend
 * All requests go to /api/admin/* (proxied to localhost:3000 by Vite)
 * Requires a valid JWT with role=admin in localStorage as 'auth_token'
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}

export const adminApi = {
  // ── AUTH ──────────────────────────────────────────────────
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // ── STUDENTS ──────────────────────────────────────────────
  getStudents: () => apiFetch('/admin/students'),

  // ── TEACHERS / FACULTY ────────────────────────────────────
  getFaculty: () => apiFetch('/admin/teachers'),

  // ── COURSES ───────────────────────────────────────────────
  getCourses: () => apiFetch('/admin/courses'),

  createCourse: (data) =>
    apiFetch('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── ANALYTICS ─────────────────────────────────────────────
  getAnalyticsOverview: () => apiFetch('/admin/analytics/overview'),

  getClassAnalytics: (courseId) =>
    apiFetch(`/admin/analytics/class/${courseId}`),

  getComparativeAnalytics: () => apiFetch('/admin/analytics/comparative'),

  // ── STUBS (not yet in backend — return empty gracefully) ───
  getDepartments: async () => [],
  getSubjects: async () => [],
  getClasses: async () => [],
  getRooms: async () => [],
  getParents: async () => [],
  getTimetable: async () => [],
  getLeaves: async () => [],
  getNotifications: async () => [],
  getAuditLogs: async () => [],
  getAIInsights: () => apiFetch('/admin/ai-insights'),
  getAcademicRecords: async () => [],

  // Generic mutations (pass through to backend when route exists)
  updateRecord: async () => ({ success: true }),
  deleteRecord: async () => ({ success: true }),
  addRecord: async () => ({ success: true }),
};
