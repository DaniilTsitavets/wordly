import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/organisms/Header'
import { AuthModal } from '@/components/organisms/AuthModal'
import { Spinner } from '@/components/atoms/Spinner'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setUser, logoutSuccess, loginSuccess } from '@/store/slices/authSlice'
import { getMe } from '@/api/user'
import { logout, loginAsGuest } from '@/api/auth'
import { ApiError } from '@/api/client'
import styles from './LayoutPage.module.scss'

const ONBOARDING_PATH = '/onboarding/daily-goal'

export function Layout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAppSelector((state) => state.auth)
  const isRealAuth = !!token && user !== null && !user?.is_guest
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      loginAsGuest()
        .then(({ access_token, user: guestUser }) =>
          dispatch(loginSuccess({ token: access_token, user: guestUser }))
        )
        .catch((err) => {
          setBootstrapError(err instanceof Error ? err.message : 'Failed to start session')
        })
      return
    }
    if (!user) {
      getMe()
        .then((profile) => dispatch(setUser(profile)))
        .catch((err: unknown) => {
          // A stale/invalid token in localStorage (expired guest session, backend
          // restart, signing-key rotation) → drop it so the next render falls
          // back to the `!token` branch and bootstraps a fresh guest session.
          // Without this the user lands on the home page with the raw Spring
          // Security 401 message rendered as page content.
          if (err instanceof ApiError && err.status === 401) {
            dispatch(logoutSuccess())
          }
        })
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
            isAdmin={user?.role === 'ADMIN'}
            onLogout={handleLogout}
            onProfileClick={() => navigate('/profile')}
            onVocabularyClick={() => navigate('/vocabulary')}
            onRecallClick={() => navigate('/recall')}
            onAiChatClick={() => navigate('/ai-chat')}
            onAdminClick={() => navigate('/admin/dashboard')}
          />
        ) : (
          <Header isAuthenticated={false} onLoginClick={() => setAuthModalOpen(true)} />
        ))}

      {token ? (
        <Outlet key={token} />
      ) : bootstrapError ? (
        <div className={styles.bootstrapState} role="alert">
          <p>Couldn't start the session: {bootstrapError}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      ) : (
        <div className={styles.bootstrapState}>
          <Spinner />
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
