import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/organisms/Header'
import { AuthModal } from '@/components/organisms/AuthModal'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setUser, logoutSuccess, loginSuccess } from '@/store/slices/authSlice'
import { getMe } from '@/api/user'
import { logout, loginAsGuest } from '@/api/auth'
import styles from './LayoutPage.module.scss'

export function Layout() {
  const dispatch = useAppDispatch()
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

  const handleLogout = () => {
    logout().catch(() => {})
    dispatch(logoutSuccess())
  }

  return (
    <div className={styles.layout}>
      {isRealAuth ? (
        <Header
          isAuthenticated
          streak={user?.streak ?? 0}
          gems={user?.gems ?? 0}
          onLogout={handleLogout}
        />
      ) : (
        <Header isAuthenticated={false} onLoginClick={() => setAuthModalOpen(true)} />
      )}

      <Outlet key={token ?? 'guest'} />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
