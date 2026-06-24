import { useEffect, useRef, useState } from 'react'
import { postActivity } from '@/api/user'

const INTERVAL_SECONDS = 30

export interface ActivityProgress {
  minutesToday: number
  dailyGoalMin: number
}

export function useActivityTracker(): ActivityProgress {
  const [progress, setProgress] = useState<ActivityProgress>({ minutesToday: 0, dailyGoalMin: 0 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isActiveRef = useRef(true)

  const startInterval = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      if (!isActiveRef.current) return
      postActivity(INTERVAL_SECONDS)
        .then((res) => {
          setProgress({ minutesToday: res.minutes_today, dailyGoalMin: res.daily_goal_min })
        })
        .catch(() => {
          // silently ignore — activity tracking is best-effort
        })
    }, INTERVAL_SECONDS * 1000)
  }

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false
        stopInterval()
      } else {
        isActiveRef.current = true
        startInterval()
      }
    }

    const handleBlur = () => {
      isActiveRef.current = false
      stopInterval()
    }

    const handleFocus = () => {
      isActiveRef.current = true
      startInterval()
    }

    if (!document.hidden) {
      startInterval()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      stopInterval()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return progress
}
