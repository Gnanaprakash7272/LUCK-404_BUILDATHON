import apiClient, { USE_MOCKS } from './client'
import { mockSubmitAssignment } from '../mocks/mockService'

export async function submitAssignment(id, contentRef) {
  if (USE_MOCKS) return mockSubmitAssignment(id)
  const { data } = await apiClient.post(`/assignments/${id}/submit`, { content_ref: contentRef })
  return data
}
