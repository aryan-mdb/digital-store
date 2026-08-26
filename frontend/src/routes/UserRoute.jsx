import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FullPageSpinner from '../components/ui/FullPageSpinner'

/** Requires an authenticated basic user — admins are redirected to their panel. */
export default function UserRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />

  return <Outlet />
}
