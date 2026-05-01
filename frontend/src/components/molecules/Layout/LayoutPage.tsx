import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/organisms/Header'
import { AuthModal } from '@/components/organisms/AuthModal'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setUser, logoutSuccess, loginSuccess } from '@/store/slices/authSlice'
import { getMe } from '@/api/user'
import { logout, loginAsGuest } from '@/api/auth'
import styles from './LayoutPage.module.scss'

const ONBOARDING_PATH = '/onboarding/daily-goal'

export function Layout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAppSelector((state) => state.auth)
  const isRealAuth = !!token && user !== null && !user?.is_guest
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      loginAsGuest()
        .then(({ access_token, user: guestUser }) =>
          dispatch(loginSuccess({ token: access_token, user: guestUser }))
        )
        .catch(() => {})
      return
    }
    if (!user) {
      getMe()
        .then((profile) => dispatch(setUser(profile)))
        .catch(() => {})
    }
  }, [token, user, dispatch])

  useEffect(() => {
    if (!isRealAuth || !user) return
    if (user.onboarding_completed && location.pathname === ONBOARDING_PATH) {
      navigate('/', { replace: true })
    }
  }, [isRealAuth, user, location.pathname, navigate])

  const handleLogout = () => {
    logout().catch(() => {})
    dispatch(logoutSuccess())
  }

  const hideHeader = location.pathname === ONBOARDING_PATH

  return (
    <div className={styles.layout}>
      {!hideHeader &&
        (isRealAuth ? (
          <Header
            isAuthenticated
            streak={user?.streak ?? 0}
            gems={user?.gems ?? 0}
            onLogout={handleLogout}
            onProfileClick={() => navigate('/profile')}
            onVocabularyClick={() => navigate('/vocabulary')}
          />
        ) : (
          <Header isAuthenticated={false} onLoginClick={() => setAuthModalOpen(true)} />
        ))}

      <Outlet key={token ?? 'guest'} />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
