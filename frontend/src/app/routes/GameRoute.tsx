import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

interface GameRouteProps {
  children: React.ReactNode
}

const FIRST_SUBTOPIC_ID = '1'

export function GameRoute({ children }: GameRouteProps) {
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)
  const { subtopicId } = useParams<{ subtopicId: string }>()
  const location = useLocation()

  if (subtopicId === FIRST_SUBTOPIC_ID) {
    return <>{children}</>
  }

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
