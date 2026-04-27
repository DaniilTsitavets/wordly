import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DailyGoal } from '@/components/organisms/DailyGoal'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/authSlice'
import { updateMe } from '@/api/user'
import styles from './OnboardingPage.module.scss'

export function OnboardingPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async (minutes: number) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await updateMe({
        daily_goal_min: minutes,
        onboarding_completed: true,
      })
      dispatch(setUser(updated))
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div>
        <DailyGoal onStart={handleStart} isSubmitting={isSubmitting} />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
