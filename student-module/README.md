# Student Module — Education Management Portal

Frontend-only Student Module built with React, Vite, Tailwind CSS, React Router,
and Axios, per the BUILDATHON 2026 brief. This package covers **only** the
student-facing UI — no backend, database, or AI logic is included or required
to explore it (it ships with a full mock data layer).

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The app opens at `http://localhost:5173`. Log in with any email and a
password of 4+ characters — the mock auth service accepts anything that
looks like real input.

## Pointing at the real backend

By default the app runs on mock data (`VITE_USE_MOCKS=true` in `.env`).
Once the backend team's endpoints are live:

1. Set `VITE_API_BASE_URL` in `.env` to the API's base URL.
2. Set `VITE_USE_MOCKS=false`.
3. Nothing else changes — every page calls a function in `src/api/*`, and
   those functions already call the exact endpoints and expect the exact
   response shapes documented in the project brief (`/api/students/me/dashboard`,
   `/api/students/me/ai-insight`, etc.). No component code needs to change.

One addition beyond the original brief: `getAttendance()` in
`src/api/students.js` calls `GET /api/students/me/attendance` for the
subject-level attendance table, since the brief's contract list didn't
include a dedicated endpoint for that. Swap it to whatever the backend
team wires up, or remove the subject table if it isn't needed.

## Project structure

```
src/
  api/          service layer — one function per endpoint, mock/real switch inside
  mocks/        mock data + mock service (matches real API shapes exactly)
  context/      AuthContext (token + user in localStorage)
  routes/       ProtectedRoute guard
  components/
    layout/     Sidebar, Navbar, Layout shell
    common/     StatCard, Badge, ProgressBar, RiskMeter, DataTable, page states
  pages/        one file per route
```

## Pages

Login · Dashboard · Course Catalog · Course Details · My Courses ·
Assignments · Attendance · Grades · Progress · AI Insights · Profile

Every page implements loading, empty, error, and unauthorized states —
no screen is ever left blank.

## Design notes

- Palette, type (Space Grotesk / Inter / IBM Plex Mono), and the segmented
  risk-meter component were chosen deliberately for a data-forward academic
  dashboard — see inline comments in `RiskMeter.jsx`.
- No gradients, glassmorphism, or decorative motion, per the brief.
- Responsive: fixed sidebar on desktop, off-canvas drawer on mobile, and a
  hamburger toggle in the navbar under `lg:` breakpoint.

## Scope boundary

This module intentionally does **not** include: backend/API implementation,
database, AI/risk-scoring logic, or recommendation algorithms. The AI
Insights page and dashboard's AI card only render whatever the
`aiInsight` / `ai-insight` payload contains.
