import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from '../api/courses'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

const CATEGORIES = [
  'All',
  'Science & Math',
  'Humanities',
  'Technology',
  'Arts',
]

/* =========================================================
   ICONS
========================================================= */

const Icons = {
  Search: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  ),

  ArrowRight: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),

  Book: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
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
      className="h-4 w-4"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
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

/* =========================================================
   CATEGORY CONFIG
========================================================= */

function getCategoryStyle(category) {
  switch (category) {
    case 'Technology':
      return {
        icon: 'bg-blue-50 text-blue-600',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
      }

    case 'Science & Math':
      return {
        icon: 'bg-indigo-50 text-indigo-600',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      }

    case 'Humanities':
      return {
        icon: 'bg-amber-50 text-amber-600',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
      }

    case 'Arts':
      return {
        icon: 'bg-pink-50 text-pink-600',
        badge: 'bg-pink-50 text-pink-700 border-pink-200',
      }

    default:
      return {
        icon: 'bg-slate-100 text-slate-600',
        badge: 'bg-slate-50 text-slate-600 border-slate-200',
      }
  }
}

/* =========================================================
   ENROLLMENT STATUS
========================================================= */

function EnrollmentStatus({ status }) {
  const normalized = String(status || '').toLowerCase()

  const isEnrolled =
    normalized.includes('enroll') &&
    !normalized.includes('available')

  const isAvailable =
    normalized.includes('available') ||
    normalized.includes('open')

  if (isEnrolled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Enrolled
      </span>
    )
  }

  if (isAvailable) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Available
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {status || 'Course'}
    </span>
  )
}

/* =========================================================
   COURSE CARD
========================================================= */

function CourseCard({ course }) {
  const categoryStyle = getCategoryStyle(course.category)

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block h-full outline-none"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-indigo-100">
        {/* Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-80" />

        <div className="flex flex-1 flex-col p-5">
          {/* Top */}
          <div className="flex items-start justify-between gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${categoryStyle.icon}`}
            >
              <Icons.Book />
            </div>

            <EnrollmentStatus status={course.enrollmentStatus} />
          </div>

          {/* Category */}
          <div className="mt-5">
            <span
              className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${categoryStyle.badge}`}
            >
              {course.category || 'General'}
            </span>
          </div>

          {/* Course title */}
          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
            {course.name}
          </h3>

          {/* Description */}
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">
            {course.description ||
              'Explore this course and discover the learning opportunities available to you.'}
          </p>

          {/* Teacher */}
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Icons.User />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Instructor
              </p>

              <p className="truncate text-xs font-semibold text-slate-700">
                {course.teacher || 'Faculty'}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
              <Icons.ArrowRight />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CourseCatalog() {
  const [courses, setCourses] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  async function load() {
    setStatus('loading')

    try {
      const data = await getCourses({
        search,
        category: category === 'All' ? '' : category,
      })

      setCourses(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250)

    return () => clearTimeout(timer)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category])

  const categoryCount = useMemo(() => {
    return courses.length
  }, [courses])

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      {/* ===================================================
          HEADER
      =================================================== */}

      <PageHeader
        title="Course Catalog"
        description="Discover courses, explore learning opportunities, and build your academic journey."
      />

      {/* ===================================================
          SEARCH + FILTER PANEL
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-5">
          {/* Search */}
          <div className="relative max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <Icons.Search />
            </div>

            <input
              type="text"
              placeholder="Search courses by name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Category
            </span>

            {CATEGORIES.map((item) => {
              const active = category === item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
          RESULTS HEADER
      =================================================== */}

      {status === 'success' && courses.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {category === 'All'
                ? 'Available courses'
                : category}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {categoryCount}{' '}
              {categoryCount === 1
                ? 'course'
                : 'courses'}{' '}
              available
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 sm:flex">
            <Icons.Sparkle />
            Explore & learn
          </div>
        </div>
      )}

      {/* ===================================================
          STATES
      =================================================== */}

      {status === 'loading' && (
        <LoadingState
          label="Loading courses…"
          rows={5}
        />
      )}

      {status === 'error' && (
        <ErrorState onRetry={load} />
      )}

      {status === 'success' && courses.length === 0 && (
        <EmptyState
          title="No courses found"
          description="Try a different search term or select another category."
        />
      )}

      {/* ===================================================
          COURSE GRID
      =================================================== */}

      {status === 'success' && courses.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      )}

      {/* ===================================================
          FOOTNOTE
      =================================================== */}

      {status === 'success' && courses.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-700">
            Course catalog:
          </span>{' '}
          Select any course to view its details, syllabus, and
          enrollment options.
        </div>
      )}
    </div>
  )
}