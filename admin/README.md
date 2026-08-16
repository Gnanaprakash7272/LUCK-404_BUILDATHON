# College Super Admin Portal

## Overview
The College Super Admin Portal is a comprehensive, frontend-first React application designed for institutional management. It provides a "Super Admin" view that spans across 13 departments, managing students, faculty, classes, timetables, academic records, and attendance. The current implementation is a robust, modular React SPA (Single Page Application) powered by Vite and styled using Tailwind CSS. 

Currently, the application relies on a local mock data service layer (`adminApi.js` and `mockAdminData.js`) to simulate deep relational data queries without requiring a live backend, allowing for complete frontend UI/UX verification.

## Key Features
- **Department Management**: Deep-drill nested views into 13 departments, exploring faculty, students, classes, and analytics.
- **Faculty & Staff Operations**: View faculty workload, assigned subjects, mentorship rosters, and timetables.
- **Student Academic Profiles**: Review student GPAs, attendance heatmaps, term records, and linked guardians.
- **Class & Timetable Matrix**: CSS-grid based timetable matrix showing periods, rooms, subjects, and conflict highlighting.
- **Analytics & AI Insights Shell**: UI rendering for institutional performance metrics and AI-driven risk assessment (currently using mock thresholds).
- **Reports Hub**: Generate CSV/PDF (mocked frontend action) for institutional data.
- **Extensive UI Components**: Custom-built DataTables, Status Badges, Drawers, Modals, and Toast notifications replacing native browser alerts.

## System Architecture

**Current Data Flow**:
`UI (React Pages)` → `React Components` → `Admin API Service (adminApi.js)` → `Mock Data Store (mockAdminData.js)`

**Architecture**:
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: `react-router-dom` v6
- **Styling**: Tailwind CSS via PostCSS/Autoprefixer, utilizing a custom Google Material Symbols font for icons.
- **State Management**: React Hooks (`useState`, `useEffect`) and Context API (`ToastContext`).
- **Data Layer**: Centralized asynchronous mock API to simulate RESTful latency and relational data joining (e.g., fetching students by `departmentId`).

## Technology Stack
- **Core**: React (^18.2.0), React DOM (^18.2.0)
- **Routing**: React Router DOM (^6.22.0)
- **Build**: Vite (^5.1.4)
- **CSS Framework**: Tailwind CSS (^3.4.1)
- **Icons**: Material Symbols Outlined (via Google Fonts in `index.html`)

## Application Modules
The application is strictly divided into three primary portals.

- **Admin Module (`/admin/*`)**: Fully implemented Super Admin view.
- **Student Module (`/student/*`)**: Basic placeholder portal shell implemented. (Pending full module build).
- **Teacher Module (`/teacher/*`)**: Basic placeholder portal shell implemented. (Pending full module build).

## Admin Features Implementation Status

### Completed (✅)
- Dashboard
- Departments (List & Details)
- Faculty & Staff (List & Details)
- Students (List & Details)
- Parents (List view)
- Subjects (List view)
- Classes (List & Details)
- Timetable (Department & Class grids)
- Rooms (List view)
- Attendance (Heatmap visualization)
- Academic Records (Term lists)
- Reports (Hub & Preview UI)
- Access Management (User list)
- Audit History (Logs view)
- Calendar (CSS Grid Monthly View)

### Partially Implemented / Shell (⚠️)
- **Analytics**: Basic mock charts/bars rendered via CSS (no external chart library like Recharts is currently wired to live data).
- **AI Insights**: UI shell exists displaying mock "At-Risk" and "Recommendation" data. No actual LLM/ML backend is connected.
- **Workload**: Basic metric cards for faculty teaching hours exist in details, but the standalone workload balancing tool is a static list.
- **Support / Settings**: Basic UI shells.

### Not Implemented (❌)
- Live Backend / Database Integration
- Real Authentication / JWT / RBAC
- File Uploads / Real PDF/CSV Generation

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm

### Instructions
1. **Clone or Download the project**
2. **Open the project directory** in your terminal.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. **Build for production**:
   ```bash
   npm run build
   ```

## Folder Structure

```text
src/
├── admin/
│   ├── components/      # Reusable UI (DataTable, Modals, Badges, Avatar)
│   ├── contexts/        # React Context (ToastContext)
│   ├── data/            # Local JSON-like mock databases (mockAdminData.js)
│   ├── pages/           # Admin Route views (Dashboard, DepartmentDetails, etc.)
│   └── services/        # Async API mock layer (adminApi.js)
├── student/             # Student portal shell
├── teacher/             # Teacher portal shell
├── App.jsx              # Main routing configuration
├── index.css            # Tailwind directives and custom variables
└── main.jsx             # React entry point
```

## Routes

| Route | Purpose | Status |
|---|---|---|
| `/` | Root Redirect | ✅ Active |
| `/admin/dashboard` | Main Super Admin Overview | ✅ Active |
| `/admin/departments` | List of all Departments | ✅ Active |
| `/admin/departments/:id` | Deep-drill Department specifics | ✅ Active |
| `/admin/faculty` | List of all Faculty | ✅ Active |
| `/admin/faculty/:id` | Faculty Profile and Workload | ✅ Active |
| `/admin/students` | List of all Students | ✅ Active |
| `/admin/students/:id` | Student Academic Profile | ✅ Active |
| `/admin/parents` | List of linked Guardians | ✅ Active |
| `/admin/subjects` | Curriculum List | ✅ Active |
| `/admin/classes` | List of all Classes/Sections | ✅ Active |
| `/admin/classes/:id` | Class Roster & Timetable | ✅ Active |
| `/admin/timetable` | Global Timetable View | ✅ Active |
| `/admin/rooms` | Infrastructure / Room usage | ✅ Active |
| `/admin/workload` | Global Faculty Workload | ✅ Active |
| `/admin/attendance` | Global Heatmap | ✅ Active |
| `/admin/calendar` | Academic Event Calendar | ✅ Active |
| `/admin/academic-records`| Institutional grade logs | ✅ Active |
| `/admin/analytics` | Statistical dashboards | ⚠️ UI Only |
| `/admin/insights` | AI-driven insights | ⚠️ UI Only |
| `/admin/reports` | Report Generator | ⚠️ UI Only |
| `/admin/access` | RBAC Management | ⚠️ UI Only |
| `/admin/audit` | System Action Logs | ✅ Active |
| `/admin/settings` | Portal Configuration | ⚠️ UI Only |
| `/admin/support` | Helpdesk | ⚠️ UI Only |
| `/student/*` | Student Portal | ⚠️ Shell Only |
| `/teacher/*` | Faculty Portal | ⚠️ Shell Only |

## Mock Data
The application currently operates entirely on `src/admin/data/mockAdminData.js`. 
This file contains relational arrays (e.g., `departments`, `faculty`, `students`, `timetable`) linked by IDs (like `departmentId` or `classId`).
Data is read-only in the service layer, though the UI permits opening "Edit" modals to demonstrate UX flow.

## Known Limitations
- **Mock Data**: Changes made in UI forms (like editing a department) are not persisted across page reloads.
- **Frontend Authentication**: There is no login screen or JWT validation. The user is immediately dropped into the Super Admin console.
- **Exporting**: Clicking "Export PDF/CSV" triggers a Toast notification rather than actually generating a file.

## Future Backend Integration
To transition this app to production, the `adminApi.js` service layer must be rewritten to make `fetch` or `axios` calls to a real Node.js/Express backend. 
Key APIs required:
- `GET /api/v1/departments`
- `GET /api/v1/faculty?departmentId=XYZ`
- `GET /api/v1/students?classId=ABC`
- `GET /api/v1/timetable?classId=ABC`

## Team / Module Ownership
- **Admin + Reports + QA**: Admin module owner (Member 4)
- **Student Experience**: Student module owner (Pending)
- **Teacher / Academic Operations**: Teacher module owner (Pending)
- **Backend + Database + AI**: Backend owner (Pending)
