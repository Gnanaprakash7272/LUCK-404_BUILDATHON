# Academic Pulse - Backend API & AI Engine

This directory contains the completely **locked and verified** backend for Academic Pulse. It provides a robust, role-based API for Students, Teachers, and Admins, powered by a custom Deterministic Risk Engine and Generative AI (Gemini).

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and configure it.
   ```bash
   cp .env.example .env
   ```
   *Required variables:*
   - `JWT_SECRET`: Secret key for signing JWT tokens.
   - `GEMINI_API_KEY`: API key for Google Gemini (for AI Explanations).
   - `DB_PATH`: Path to SQLite database (default: `./data/academic_pulse.db`).

3. **Start the server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

4. **Reset Demo Data (Before Presentations):**
   To cleanly wipe all academic data and reset it to the initial deterministic state (e.g., John Doe correctly showing as At-Risk), run the reset script:
   ```bash
   node src/db/reset_demo.js
   ```

## 🏗️ Architecture & Structure

```text
backend/
├── src/
│   ├── ai/                 🧠 AI ENGINE (Deterministic Risk + Gemini Fallback)
│   ├── config/             ⚙️ Configuration
│   ├── controllers/        🎮 Business & API logic
│   ├── db/                 🗄️ SQLite Database & Seed Data
│   ├── middleware/         🔐 JWT + RBAC (Role-Based Access Control)
│   ├── routes/             🌐 API endpoints
│   └── app.js              🚀 Express entry point
│
├── .env                    🔑 Secrets (Git Ignored)
├── package.json            📦 Dependencies
├── test_*.js               🧪 Comprehensive Test Suite
└── verify_stage4.js        🔒 Security Verification Tests
```

## 🧠 AI Engine (`src/ai`)
The backend features a split-architecture AI system to guarantee accuracy and explainability:
1. **Deterministic Engine (`deterministicEngine.js`)**: Analyzes attendance, exam marks, assignment submissions, and grading trends to calculate an objective **Risk Score (0-100)** and a discrete **Risk Level** (`LOW`, `MEDIUM`, `HIGH`). It also identifies the weakest subject.
2. **Generative LLM (`llmService.js`)**: Passes the deterministic evidence to Google Gemini 2.5 Flash to explain validated academic evidence and generate actionable recommendations for the student.
3. **AI Service (`aiService.js`)**: Orchestrates the process, handles database caching (so we don't spam the LLM), and manages deterministic fallbacks if Gemini is unreachable.

## 📡 API Contracts

All protected routes require an `Authorization: Bearer <JWT_TOKEN>` header.

### 👤 Student APIs (`/api/students`)
- `GET /api/students/me/dashboard` - Get student profile, courses, and attendance summary.
- `GET /api/students/me/courses` - List enrolled courses.
- `GET /api/students/me/courses/:id` - Get specific course details.
- `POST /api/students/me/courses/:id/enroll` - Enroll in a course.
- `GET /api/students/me/assignments` - Get pending/submitted assignments.
- `POST /api/students/me/assignments/:id/submit` - Submit an assignment.
- `GET /api/students/me/grades` - View all grades.
- `GET /api/students/me/attendance` - View attendance records.
- `GET /api/students/me/ai-insight` - **[AI]** Fetch personalized AI risk explanation and recommendation.

### 👨‍🏫 Teacher APIs (`/api/teacher` & `/api/assignments` & `/api/exams`)
- `GET /api/teacher/me` - Get teacher profile.
- `GET /api/teacher/me/courses` - List teacher's courses.
- `GET /api/teacher/me/classes` - List teacher's classes.
- `GET /api/teacher/me/classes/:id/students` - List students in a class.
- `GET /api/teacher/students/:studentId/profile` - View specific student profile.
- `GET /api/teacher/me/assignments` - List assignments created by the teacher.
- `POST /api/assignments` - Create a new assignment.
- `GET /api/assignments/:id/submissions` - View submissions for an assignment.
- `POST /api/assignments/:id/grade` - Grade an assignment submission.
- `POST /api/attendance` - Record daily class attendance.
- `GET /api/attendance` - View attendance history for a class.
- `POST /api/exams` - Create a new exam.
- `POST /api/exams/:id/marks` - Record exam marks.
- `GET /api/exams/:id/marks` - View exam marks.
- `GET /api/teacher/me/at-risk-students` - **[AI]** View students in the teacher's classes with `HIGH` or `MEDIUM` AI risk scores.

### 🛡️ Admin APIs (`/api/admin`)
- `GET /api/admin/analytics/overview` - Platform-wide statistics.
- `GET /api/admin/analytics/class/:courseId` - Course specific performance averages.
- `GET /api/admin/analytics/comparative` - Compare performance across all courses.
- `GET /api/admin/students` - List all students.
- `GET /api/admin/teachers` - List all teachers.
- `GET /api/admin/courses` - List all courses.
- `POST /api/admin/courses` - Create a new course.

---
**Status**: `LOCKED` 🔒 (Do not modify core backend routes or DB schema for frontend integration).
