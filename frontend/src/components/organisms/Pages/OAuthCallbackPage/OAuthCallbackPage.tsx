import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { signInWithGoogle } from '@/api/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginSuccess } from '@/store/slices/authSlice'
import { GOOGLE_REDIRECT_URI } from '@/utils/oauth'
import styles from './OAuthCallbackPage.module.scss'

// Google codes are single-use. Module-level Set survives Outlet remount so a
// code is exchanged at most once.
const attemptedCodes = new Set<string>()

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const initialError = oauthError ?? (code ? null : 'Missing authorization code')
  const [error, setError] = useState<string | null>(initialError)

  // Drive navigation off Redux so a remounted instance still leaves the page.
  useEffect(() => {
    if (user && !user.is_guest) {
      navigate(user.onboarding_completed ? '/' : '/onboarding/daily-goal', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (initialError || !code) return
    if (attemptedCodes.has(code)) return
    attemptedCodes.add(code)

    let cancelled = false
    const run = async () => {
      try {
        const { access_token, user } = await signInWithGoogle({
          code,
          redirect_uri: GOOGLE_REDIRECT_URI,
        })
        // Dispatch unconditionally — Redux is global, the result is valid
        // even if this instance was already unmounted by an Outlet remount
        // (e.g. a parallel `setUser(guest)` from Layout's `getMe` won the
        // race). Without this, the real user from the exchange is lost and
        // the page sits on the spinner forever.
        dispatch(loginSuccess({ token: access_token, user }))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Google sign-in failed')
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [code, initialError, dispatch])

  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.error} role="alert">
          {error}
        </p>
        <button
          type="button"
          className={styles.retryBtn}
          onClick={() => navigate('/', { replace: true })}
        >
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Spinner />
      <p className={styles.message}>Signing you in with Google…</p>
    </div>
  )
}
