import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// AdminRoute.jsx — a wrapper component that protects admin-only pages.
// If the user is not logged in → redirect to /login
// If the user is logged in but is a STUDENT → redirect to /student/dashboard
// Only ADMINs can pass through and see the protected page (children).
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/student/dashboard" replace />
  }

  return children
}

export default AdminRoute
