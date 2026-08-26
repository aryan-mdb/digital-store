import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FullPageSpinner from '../components/ui/FullPageSpinner'

/** Requires an authenticated admin — basic users are redirected to their dashboard. */
export default function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
