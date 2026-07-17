import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// StudentRoute.jsx — a wrapper component that protects student-only pages.
// If the user is not logged in → redirect to /login
// If the user is logged in but is an ADMIN → redirect to /admin/dashboard
// Only STUDENTs can pass through and see the protected page.
function StudentRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'STUDENT') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export default StudentRoute
