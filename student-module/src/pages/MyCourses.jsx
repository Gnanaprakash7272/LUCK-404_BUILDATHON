import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from '../api/courses'
import { getDashboard } from '../api/students'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function ProgressRing({ value = 0 }) {
  const percentage = Math.min(100, Math.max(0, Number(value) || 0))
  const radius = 25
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg
        className="h-16 w-16 -rotate-90"
        viewBox="0 0 64 64"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-slate-100"
        />

        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-indigo-500 transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-800">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

function CourseIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-600 group-hover:text-white">
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M8 6h8" />
        <path d="M8 10h6" />
      </svg>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export default function MyCourses() {
  const [courses, setCourses] = useState([])
  const [progressByName, setProgressByName] = useState({})
  const [status, setStatus] = useState('loading')

  async function load() {
    setStatus('loading')

    try {
      const [allCourses, dashboard] = await Promise.all([
        getCourses(),
        getDashboard(),
      ])

      setCourses(
        allCourses.filter(
          (course) => course.enrollmentStatus === 'Enrolled'
        )
      )

      const map = {}

      dashboard.courseProgress?.forEach((course) => {
        map[course.course] = course.completionPct
      })

      setProgressByName(map)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const averageProgress =
    courses.length > 0
      ? Math.round(
        courses.reduce(
          (total, course) =>
            total + (progressByName[course.name] ?? 0),
          0
        ) / courses.length
      )
      : 0

  return (
    <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-500">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <PageHeader
          title="My Courses"
          description="Stay on top of the courses you're currently enrolled in."
        />
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {status === 'loading' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoadingState
            label="Loading your courses…"
            rows={4}
          />
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {status === 'error' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ErrorState onRetry={load} />
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {status === 'success' && courses.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <EmptyState
            title="No enrolled courses"
            description="You haven't enrolled in any courses yet. Explore the catalog and find something that interests you."
            action={
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100"
              >
                Browse course catalog
                <ArrowIcon />
              </Link>
            }
          />
        </div>
      )}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {status === 'success' && courses.length > 0 && (
        <>
          {/* Overview strip */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enrolled courses
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-black tracking-tight text-slate-950">
                  {courses.length}
                </span>

                <span className="mb-1 text-xs font-medium text-slate-400">
                  active
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall progress
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-black tracking-tight text-slate-950">
                  {averageProgress}%
                </span>

                <span className="mb-1 text-xs font-medium text-slate-400">
                  completed
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                Keep going
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-indigo-950">
                Consistent progress across your courses keeps your academic
                momentum strong.
              </p>
            </div>
          </div>

          {/* Section header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                Active learning
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current courses and completion progress.
              </p>
            </div>

            <Link
              to="/courses"
              className="hidden items-center gap-1.5 text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700 sm:flex"
            >
              Browse catalog
              <ArrowIcon />
            </Link>
          </div>

          {/* =================================================
              COURSE GRID
          ================================================= */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const progress = Math.min(
                100,
                Math.max(
                  0,
                  Number(progressByName[course.name] ?? 0)
                )
              )

              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="group block"
                >
                  <article className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/70">
                    {/* Top accent */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 opacity-80" />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <CourseIcon />

                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Enrolled
                      </span>
                    </div>

                    {/* Course info */}
                    <div className="mt-5 flex-1">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-500">
                        {course.department || 'CORE'}
                      </p>

                      <h3 className="line-clamp-2 text-lg font-black leading-6 tracking-tight text-slate-950 transition-colors group-hover:text-indigo-600">
                        {course.name}
                      </h3>

                      {course.teacher && (
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          {course.teacher}
                        </p>
                      )}

                      {course.schedule && (
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                          <ClockIcon />
                          <span>{course.schedule}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                              Course progress
                            </span>

                            <span className="text-xs font-black text-slate-800">
                              {Math.round(progress)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>

                        <ProgressRing value={progress} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        View course
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                        <ArrowIcon />
                      </span>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}