import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { signInWithGoogle } from '@/api/auth'
import { useAppDispatch } from '@/store/hooks'
import { loginSuccess } from '@/store/slices/authSlice'
import { GOOGLE_REDIRECT_URI } from '@/utils/oauth'
import styles from './OAuthCallbackPage.module.scss'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const initialError = oauthError ?? (code ? null : 'Missing authorization code')
  const [error, setError] = useState<string | null>(initialError)

  useEffect(() => {
    if (initialError || !code) return
    let cancelled = false
    const run = async () => {
      try {
        const { access_token, user } = await signInWithGoogle({
          code,
          redirect_uri: GOOGLE_REDIRECT_URI,
        })
        if (cancelled) return
        dispatch(loginSuccess({ token: access_token, user }))
        navigate(user.onboarding_completed ? '/' : '/onboarding/daily-goal', { replace: true })
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
  }, [code, initialError, navigate, dispatch])

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
