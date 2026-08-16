# School Academic Management System — AI-Powered Student Risk Monitoring

A school ERP system with three role-based frontends (Student, Teacher/Staff, Admin) and a shared backend that powers an AI risk-monitoring engine to flag students who need academic attention.

---

## 📁 Project Files & Master Prompts

This project contains **master prompts** and complete source code for the **Teacher/Staff frontend module**.

| File / Folder | Purpose |
|---|---|
| `c:\Builtathon\src\` | Full source code for the **Teacher/Staff Frontend (React + TypeScript + Tailwind CSS)** |
| `teacher-dashboard-master-prompt.md` | Full spec for the **Teacher/Staff frontend** — pages, dashboard layout, AI insight display, timetable, API contracts, priorities, light-theme UI/UX rules, and optional enhancement features. |
| `backend-master-prompt.md` | Full spec for the **Backend** — database schema, auth, all API contracts (locked + pending), AI risk-scoring engine logic, validation rules, priorities. |
| `dashboard-master-prompt-template.md` | A **role-agnostic template** version of the frontend prompt — reuse the same structure/format/UI-UX rules to build the Student or Admin dashboard by filling in the `[bracketed]` sections. |
| `run-teacher-dashboard.sh` | Shell script to feed `teacher-dashboard-master-prompt.md` into Claude Code CLI and start building the Teacher frontend project. |

---

## 🧭 System Architecture

```
                 MEMBER 1
        Backend + Database + AI
                   │
                   │ REST APIs
                   ▼
        ┌─────────────────────┐
        │   FRONTENDS          │
        ├─────────────────────┤
        │ Student Dashboard    │
        │ Teacher Dashboard    │ (Built in this repository)
        │ Admin Dashboard      │
        └──────────┬──────────┘
                   │
                   ▼
                 USERS
                   │
                   ▼
             INTERVENTION
```

**Golden rule across the whole system:** Backend/AI → calculates → Frontend → displays → User → acts. Frontends never calculate risk, grades, or trends — they only consume and render backend contracts.

---

## 🚦 Build Order

1. **Backend first (or in parallel):**
   - Lock database schema (`users`, `courses`, `classes`, `enrollments`, `attendance`, `assignments`, `assignment_submissions`, `exams`, `exam_marks`, `ai_insights`).
   - Implement already-agreed core APIs.
   - Implement the AI risk engine and `GET /api/teacher/me/at-risk-students`.
   - Implement new Teacher-read APIs.

2. **Teacher frontend:**
   - Build against `teacher-dashboard-master-prompt.md`.
   - Use mocked data for any endpoint not yet finalized by backend (clearly flagged, isolated in hooks/services so swapping to real APIs later needs no component rewrite).

3. **Student & Admin frontends:**
   - Use `dashboard-master-prompt-template.md`, fill in role-specific sections.
   - Confirm their own API contracts with the backend owner before locking endpoint names.

---

## 🎨 UI/UX Standard (applies to all frontends)

- **Light theme only** — no dark mode anywhere.
- Sidebar + top bar layout, responsive.
- Consistent risk color-coding: 🔴 HIGH, 🟠 MEDIUM, 🟢 LOW/Stable.
- Clear loading / error / empty states on every data screen.
- Tables/cards over dense paragraphs — built for quick scanning.

---

## 🤖 AI Insight Contract (do not rename fields)

Every frontend that shows AI risk data consumes this exact shape from the backend:

```json
{
  "student_id": "",
  "name": "",
  "risk_level": "HIGH | MEDIUM | LOW",
  "risk_score": 0,
  "weak_subject": "",
  "evidence": {
    "attendance_pct": 0,
    "weak_subject": "",
    "weak_subject_avg": 0,
    "pending_assignments": 0,
    "trend": "",
    "trend_detail": ""
  },
  "recommendation": ""
}
```

---

## ▶️ How to Run the Teacher/Staff Frontend

```bash
# Navigate to project root
cd c:/Builtathon

# Install dependencies (if not already done)
npm install

# Start Vite React development server
npm run dev

# Run production TypeScript & Vite build
npm run build
```

---

## ✅ Current Status

| Area | Status |
|---|---|
| Teacher/Staff frontend spec | ✅ Approved & Built |
| Backend/DB/AI spec | ✅ Drafted |
| Student frontend spec | ✅ Approved (use template) |
| Admin frontend spec | ⏳ Pending review |
| `classes` as real DB entity | 🔥 Must be finalized before schema lock |
| New Teacher-read APIs | 🔥 To be implemented before Teacher frontend goes live |

---

## ⚠️ Rules That Apply Everywhere

- No client-side AI/risk calculation — ever.
- No renamed API contract fields.
- No invented/unagreed backend endpoints — mock clearly, flag as pending, confirm with backend owner.
- No dark theme.
- `classes` must be a real, first-class database entity — not derived from courses.
