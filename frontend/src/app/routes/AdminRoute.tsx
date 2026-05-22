import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setUser, logoutSuccess } from '@/store/slices/authSlice'
import { getMe } from '@/api/user'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    if (token && !user) {
      getMe()
        .then((profile) => dispatch(setUser(profile)))
        .catch(() => dispatch(logoutSuccess()))
    }
  }, [token, user, dispatch])

  if (!token) {
    return <Navigate to="/" state={{ showLogin: true }} replace />
  }

  if (!user) {
    return null
  }

  if (user.is_guest || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
