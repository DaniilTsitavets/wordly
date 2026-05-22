import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/" state={{ showLogin: true, from: location.pathname }} replace />
  }

  if (!user) {
    return null
  }

  if (user.is_guest) {
    return <Navigate to="/" state={{ showLogin: true, from: location.pathname }} replace />
  }

  return <>{children}</>
}
