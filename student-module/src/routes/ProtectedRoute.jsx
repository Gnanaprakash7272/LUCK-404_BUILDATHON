import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STUDENT_ROLES = ['student']
const STAFF_LOGIN   = 'http://localhost:5174'  // Staff dev URL (vite default 5174)
const ADMIN_LOGIN   = 'http://localhost:5175'   // Admin dev URL

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // 1. Not authenticated at all → go to centralized login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 2. Authenticated but wrong role for this portal
  const role = (user?.role || '').toLowerCase()
  if (!STUDENT_ROLES.includes(role)) {
    // Redirect to correct portal
    if (role === 'teacher' || role === 'staff' || role === 'faculty') {
      window.location.href = STAFF_LOGIN
      return null
    }
    if (role === 'admin' || role === 'administrator') {
      window.location.href = `${ADMIN_LOGIN}/admin/dashboard`
      return null
    }
    // Unknown role — go back to login
    return <Navigate to="/login" replace />
  }

  return children
}
