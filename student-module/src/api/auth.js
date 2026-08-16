import apiClient, { USE_MOCKS } from './client'
import { mockLogin, mockRegister } from '../mocks/mockService'

export async function login(email, password) {
  if (USE_MOCKS) return mockLogin(email, password)
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data
}

export async function register(name, email, password) {
  if (USE_MOCKS) return mockRegister(name, email, password)
  const { data } = await apiClient.post('/auth/register', { name, email, password })
  return data
}
