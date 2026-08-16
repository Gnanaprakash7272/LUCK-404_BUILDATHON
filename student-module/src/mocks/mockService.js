// Simulated network layer used when VITE_USE_MOCKS=true or a real API call fails.
// Every function resolves with the same shape the real endpoint documented
// in the project brief would return.

import {
  mockUser,
  mockDashboard,
  mockCourses,
  mockAssignments,
  mockGrades,
  mockProgress,
  mockAiInsight,
  mockAttendance,
} from './mockData'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockLogin(email, password) {
  await delay(600)
  if (!email || !password) {
    const err = new Error('Email and password are required')
    err.status = 400
    throw err
  }
  if (password.length < 4) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }
  return { token: 'mock-jwt-token', user: { ...mockUser, email } }
}

export async function mockRegister(name, email, password) {
  await delay(700)
  if (!name || !email || !password) {
    const err = new Error('Name, email, and password are required')
    err.status = 400
    throw err
  }
  return { token: 'mock-jwt-token', user: { ...mockUser, name, email } }
}

export async function mockGetDashboard() {
  await delay(500)
  return mockDashboard
}

export async function mockGetCourses({ search = '', category = '' } = {}) {
  await delay(450)
  return mockCourses.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category ? c.category === category : true
    return matchesSearch && matchesCategory
  })
}

export async function mockGetCourseById(id) {
  await delay(400)
  const course = mockCourses.find((c) => String(c.id) === String(id))
  if (!course) {
    const err = new Error('Course not found')
    err.status = 404
    throw err
  }
  return course
}

export async function mockEnrollCourse(id) {
  await delay(600)
  const course = mockCourses.find((c) => String(c.id) === String(id))
  if (!course) {
    const err = new Error('Course not found')
    err.status = 404
    throw err
  }
  course.enrollmentStatus = 'Enrolled'
  return { success: true, enrollmentStatus: 'Enrolled' }
}

export async function mockGetAssignments() {
  await delay(450)
  return mockAssignments
}

export async function mockSubmitAssignment(id) {
  await delay(700)
  const assignment = mockAssignments.find((a) => String(a.id) === String(id))
  if (!assignment) {
    const err = new Error('Assignment not found')
    err.status = 404
    throw err
  }
  assignment.status = 'Submitted'
  return { success: true, status: 'Submitted' }
}

export async function mockGetGrades() {
  await delay(450)
  return mockGrades
}

export async function mockGetProgress() {
  await delay(450)
  return mockProgress
}

export async function mockGetAiInsight() {
  await delay(500)
  return mockAiInsight
}

export async function mockGetAttendance() {
  await delay(450)
  return mockAttendance
}
