# 🎓 Academic Pulse

> **An intelligent, AI-powered campus ERP system** built for the Buildathon. Academic Pulse delivers institution-wide academic tracking, role-based portals, a deterministic AI risk engine, and generative AI insights — all driven by a single shared backend and database.

---

## 🏗️ Architecture Overview

```
academic-pulse/
├── backend/          Node.js + Express + SQLite (Port 3000)
├── student-module/   React Student Portal      (Port 5173)
├── staffdashboard/   React Staff Portal        (Port 5174)
├── admin/            React Admin Portal        (Port 5175)
└── campus-portal-login.html  (Standalone HTML reference login)
```

### The AI Consistency Guarantee

All three portals consume the **exact same deterministic risk engine** and the **same SQLite database**. No portal fabricates or recalculates risk scores — they are always fetched from the backend.

```
                    SQLite
                      │
                      ▼
             Deterministic Engine
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Student      Staff       Admin
       :5173        :5174       :5175
          │           │           │
          └───────────┼───────────┘
                      ▼
              SAME AI EVALUATION
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm

### 1. Backend
```bash
cd backend
cp .env.example .env   # fill in GEMINI_API_KEY and JWT_SECRET
npm install
node src/app.js        # runs on :3000
```

> **Seed the database first** (only needed once):
> ```bash
> node src/db/seed.js
> ```

### 2. Student Portal
```bash
cd student-module
npm install
npm run dev            # runs on :5173
```

### 3. Staff Portal
```bash
cd staffdashboard
npm install
npm run dev            # runs on :5174
```

### 4. Admin Portal
```bash
cd admin
npm install
npm run dev            # runs on :5175
```

---

## 🔐 Authentication & RBAC

All portals share **one login endpoint**:

```
POST /api/auth/login
Body: { email, password }
Returns: { token, role, user }
```

After login, the client reads `role` from the JWT and redirects:

| Role    | Portal | Port |
|---------|--------|------|
| student | Student Portal | :5173 |
| teacher | Staff Portal   | :5174 |
| admin   | Admin Portal   | :5175 |

### Demo Credentials

| Role    | Email                       | Password      |
|---------|-----------------------------|--------------|
| Student | john@academicpulse.com      | password123   |
| Teacher | alan@academicpulse.com      | password123   |
| Teacher | ada@academicpulse.com       | password123   |
| Admin   | admin@academicpulse.com     | password123   |

---

## 🤖 AI System

### Deterministic Risk Engine (`backend/src/ai/deterministicEngine.js`)

Calculates a **deterministic, reproducible risk score (0–100)** for each student using four weighted factors:

| Factor | Max Points | Condition |
|--------|-----------|-----------|
| Attendance | 40 pts | Attendance < 75% |
| Weak Subject | 30 pts | Lowest subject avg < 60% |
| Pending Assignments | 20 pts | 10 pts per pending task |
| Performance Trend | 10 pts | Trend is DECLINING |

Risk levels:
- `score ≥ 60` → **HIGH**
- `score ≥ 30` → **MEDIUM**
- `score < 30`  → **LOW**

### Generative AI Layer (`backend/src/ai/llmService.js`)

Once the risk score is calculated deterministically, it is passed to **Google Gemini 2.5 Flash** with a strict prompt: the LLM may only explain and recommend — it cannot change or invent the score.

### Persistence (`backend/src/ai/aiService.js`)

Generated insights are stored in the `ai_insights` SQLite table on first generation. Subsequent requests return the cached result, guaranteeing consistency across portals.

---

## 📡 Backend API Reference

Base URL: `http://localhost:3000/api`

> All routes except `/auth/login` require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login, get JWT + role |

### Student Routes (role: student)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students/me/dashboard` | Full dashboard data |
| GET | `/students/me/ai-insight` | AI risk assessment |
| GET | `/students/me/assignments` | Assignment list |
| GET | `/students/me/grades` | Grade records |
| GET | `/students/me/attendance` | Attendance summary |

### Teacher Routes (role: teacher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teacher/me/dashboard` | Teacher dashboard |
| GET | `/teacher/me/classes` | Assigned classes |
| GET | `/teacher/me/at-risk-students` | At-risk student list with AI scores |
| GET | `/teacher/me/students/:id/insight` | Student AI insight (teacher view) |

### Admin Routes (role: admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/students` | All students |
| GET | `/admin/teachers` | All faculty |
| GET | `/admin/courses` | All courses |
| POST | `/admin/courses` | Create a course |
| GET | `/admin/analytics/overview` | Institution-level analytics |
| GET | `/admin/analytics/class/:courseId` | Per-class analytics |
| GET | `/admin/analytics/comparative` | Cross-class comparison |
| GET | `/admin/ai-insights` | AI risk for ALL students (institution view) |

---

## ✅ Feature Completion Status

| Feature | Status |
|---------|--------|
| Central Login (shared for all roles) | ✅ Complete |
| Student Portal | ✅ Complete |
| Staff Portal | ✅ Complete |
| Admin Portal | ✅ Complete |
| Role-Based Access Control (RBAC) | ✅ Complete |
| AI Risk Engine (Student view) | ✅ Complete |
| AI Risk Engine (Staff view) | ✅ Complete |
| AI Risk Engine (Admin view) | ✅ Complete |
| Gradebook | ✅ Complete |
| Analytics | ✅ Complete |
| Schedule | ✅ Complete |
| Attendance History | ✅ Complete |
| Student Profile | ✅ Complete |
| Class Details | ✅ Complete |
| CSV Export | ✅ Complete |
| Admin AI Command Center | ✅ Complete |
| Academic Performance Report (PDF) | ✅ Complete |

---

## 📄 Academic Performance Report (PDF)

Students can generate a PDF of their academic report directly from the dashboard:

1. Log in as a student → Dashboard
2. Click **"Download PDF Report"** → opens `/report` in a new tab
3. Both APIs are called simultaneously:
   - `GET /api/students/me/dashboard` → student info + attendance + scores
   - `GET /api/students/me/ai-insight` → full AI assessment
4. The report renders as A4 and `window.print()` triggers automatically
5. Select **"Save as PDF"** in the browser print dialog

The report includes:
- Student Information
- Academic Overview (Attendance, Performance, Pending Assignments)
- AI Risk Assessment (Risk Score, Risk Level, Weak Subject, Trend)
- Evidence Summary
- AI Explanation + Personalized Recommendation

> No values are hardcoded. The PDF is 100% generated from live backend data.

---

## 🗄️ Database Schema

SQLite database at `backend/data/academic_pulse.db`.

Core tables:
- `users` — all users (students, teachers, admins)
- `students` / `teachers` — role-specific profiles
- `courses` / `classes` — course and class records
- `enrollments` — student ↔ class relationships
- `attendance` — per-session attendance records
- `assignments` / `assignment_submissions` — assignment tracking
- `exams` / `exam_marks` — exam and grade records
- `ai_insights` — cached AI risk assessments (deterministic, persistent)

---

## 🔧 Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🧪 Test Scripts (Backend)

All test scripts are self-contained and spin up a temporary server:

```bash
cd backend
node test_auth.js      # Auth + RBAC security tests
node test_student.js   # Student API tests
node test_teacher.js   # Teacher API tests
node test_admin.js     # Admin API + AI Insights sanity check
node test_stage6a.js   # AI Engine — risk level validation
node test_stage6b.js   # AI Engine — determinism check
node test_stage6c.js   # AI Engine — full integration test
```

---

## 📁 Key Files

| Path | Purpose |
|------|---------|
| `backend/src/app.js` | Express server entry point |
| `backend/src/ai/deterministicEngine.js` | Core risk scoring logic |
| `backend/src/ai/aiService.js` | AI insight generation + caching |
| `backend/src/ai/llmService.js` | Gemini LLM integration |
| `backend/src/db/seed.js` | Database seeding (John Doe + demo data) |
| `backend/src/db/schema.js` | SQLite schema definitions |
| `student-module/src/pages/Dashboard.jsx` | Student dashboard |
| `student-module/src/pages/PerformanceReport.jsx` | Printable PDF report |
| `student-module/src/pages/AIInsights.jsx` | Student AI analysis page |
| `staffdashboard/src/pages/DashboardPage.tsx` | Staff dashboard |
| `admin/src/admin/pages/AIInsights.jsx` | Admin AI Command Center |
| `admin/src/admin/services/adminApi.js` | Admin API service layer |
| `campus-portal-login.html` | Standalone HTML login reference |

---

## 📌 Repository Rules

- ⛔ **Do NOT modify** the backend routes or database schema without team agreement.
- ⛔ **Do NOT hardcode** academic values in any frontend component.
- ⛔ **Do NOT use** mock data in the final demo build.
- ✅ All AI scores and recommendations **must flow from the backend API**.

---

*Built for the LUCK 404 Buildathon · Academic Pulse Team · 2026*
