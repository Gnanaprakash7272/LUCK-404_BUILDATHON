import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourseById, enrollInCourse } from '../api/courses'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'

const Icons = {
  ArrowLeft: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  ),

  Book: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </svg>
  ),

  User: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
    </svg>
  ),

  Calendar: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),

  Clock: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),

  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  ),

  Sparkle: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  ),
}

function getCategoryStyle(category) {
  switch (category) {
    case 'Technology':
      return 'bg-blue-50 text-blue-700 border-blue-200'

    case 'Science & Math':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'

    case 'Humanities':
      return 'bg-amber-50 text-amber-700 border-amber-200'

    case 'Arts':
      return 'bg-pink-50 text-pink-700 border-pink-200'

    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

function StatusBadge({ enrolled, status }) {
  if (enrolled) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Enrolled
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      {status || 'Available'}
    </span>
  )
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
          {value || 'Not specified'}
        </p>
      </div>
    </div>
  )
}

export default function CourseDetails() {
  const { id } = useParams()

  const [course, setCourse] = useState(null)
  const [status, setStatus] = useState('loading')
  const [enrollStatus, setEnrollStatus] = useState('idle')
  const [enrollError, setEnrollError] = useState('')

  async function load() {
    setStatus('loading')

    try {
      const data = await getCourseById(id)

      setCourse(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleEnroll() {
    setEnrollStatus('loading')
    setEnrollError('')

    try {
      const res = await enrollInCourse(id)

      setCourse((current) => ({
        ...current,
        enrollmentStatus:
          res.enrollmentStatus || 'Enrolled',
      }))

      setEnrollStatus('success')
    } catch (err) {
      setEnrollError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Enrollment failed. Try again.'
      )

      setEnrollStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl">
        <LoadingState
          label="Loading course details…"
          rows={5}
        />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-7xl">
        <ErrorState onRetry={load} />
      </div>
    )
  }

  const isEnrolled =
    String(course.enrollmentStatus || '').toLowerCase() ===
    'enrolled'

  return (
    <div className="mx-auto max-w-7xl pb-12 animate-in fade-in duration-500">
      {/* =====================================================
          BACK NAVIGATION
      ===================================================== */}

      <Link
        to="/courses"
        className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <Icons.ArrowLeft />
        Back to course catalog
      </Link>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-7">
            {/* Top metadata */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${getCategoryStyle(
                  course.category
                )}`}
              >
                {course.category || 'General'}
              </span>

              <StatusBadge
                enrolled={isEnrolled}
                status={course.enrollmentStatus}
              />
            </div>

            {/* Main title */}
            <div className="max-w-4xl">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {course.name}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
                {course.description ||
                  'Explore the course content, learning structure, and academic opportunities available in this course.'}
              </p>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Icons.User />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Course instructor
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  {course.instructor || course.teacher || 'Faculty'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT GRID
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===================================================
            LEFT CONTENT
        =================================================== */}

        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icons.Book />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Course Overview
                </h2>

                <p className="text-xs text-slate-400">
                  What you'll learn
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-sm leading-7 text-slate-600">
                {course.description ||
                  'Course description is not available at the moment.'}
              </p>
            </div>
          </section>

          {/* Why this course */}
          <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Icons.Sparkle />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Your learning journey
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Stay consistent with your coursework, attend classes
                  regularly, and keep track of assignments and assessments
                  through your Academic Pulse dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                'Attend regularly',
                'Complete assignments',
                'Track your progress',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <Icons.Check />
                  </span>

                  <span className="text-xs font-semibold text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <aside>
          <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-slate-100 bg-slate-50/70 p-5">
              <h2 className="text-base font-bold text-slate-900">
                Course Details
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Information about this course
              </p>
            </div>

            {/* Details */}
            <div className="space-y-5 p-5">
              <DetailItem
                icon={<Icons.User />}
                label="Instructor"
                value={
                  course.instructor ||
                  course.teacher ||
                  'Faculty'
                }
              />

              <DetailItem
                icon={<Icons.Calendar />}
                label="Schedule"
                value={course.schedule}
              />

              <DetailItem
                icon={<Icons.Clock />}
                label="Duration"
                value={course.duration}
              />
            </div>

            {/* Enrollment section */}
            <div className="border-t border-slate-100 p-5">
              {enrollError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {enrollError}
                </div>
              )}

              {enrollStatus === 'success' && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-700">
                  <span className="mt-0.5">
                    <Icons.Check />
                  </span>

                  <span>
                    You're successfully enrolled in this course.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleEnroll}
                disabled={
                  isEnrolled ||
                  enrollStatus === 'loading'
                }
                className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isEnrolled
                    ? 'cursor-default border border-green-200 bg-green-50 text-green-700'
                    : 'bg-slate-900 text-white shadow-sm hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-md active:translate-y-0'
                  } ${enrollStatus === 'loading'
                    ? 'cursor-wait opacity-80'
                    : ''
                  }`}
              >
                {enrollStatus === 'loading' && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {isEnrolled
                  ? 'Already Enrolled'
                  : enrollStatus === 'loading'
                    ? 'Enrolling…'
                    : 'Enroll in Course'}
              </button>

              {!isEnrolled && (
                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  Enroll to add this course to your academic
                  workspace.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}