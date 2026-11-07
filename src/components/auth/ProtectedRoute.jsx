import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function ProtectedRoute({ allowedRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user || !profile || profile.role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
