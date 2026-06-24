import { useEffect, useState, useCallback } from 'react'
import { getDailyProgress } from '@/api/user'
import type { DailyProgress } from '@/api/user'

export function useDailyProgress() {
  const [data, setData] = useState<DailyProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await getDailyProgress()
      setData(result)
    } catch {
      // silently fail, keep previous data
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const minutesToday = data?.minutes_today ?? 0
  const dailyGoalMin = data?.daily_goal_min ?? 10
  const progress =
    dailyGoalMin > 0 ? Math.min(100, Math.round((minutesToday / dailyGoalMin) * 100)) : 0

  return { minutesToday, dailyGoalMin, progress, isLoading, refetch: fetch }
}
