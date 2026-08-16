import apiClient, { USE_MOCKS } from './client'
import { mockGetCourses, mockGetCourseById, mockEnrollCourse } from '../mocks/mockService'

export async function getCourses({ search = '', category = '' } = {}) {
  if (USE_MOCKS) return mockGetCourses({ search, category })
  const { data } = await apiClient.get('/courses', { params: { search, category } })
  return data
}

export async function getCourseById(id) {
  if (USE_MOCKS) return mockGetCourseById(id)
  const { data } = await apiClient.get(`/courses/${id}`)
  return data
}

export async function enrollInCourse(id) {
  if (USE_MOCKS) return mockEnrollCourse(id)
  const { data } = await apiClient.post(`/courses/${id}/enroll`)
  return data
}
