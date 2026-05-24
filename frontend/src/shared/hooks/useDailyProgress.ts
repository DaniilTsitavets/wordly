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

  const wordsLearnedToday = data?.words_learned_today ?? 0
  const dailyGoalWords = data?.daily_goal_words ?? 10
  const progress =
    dailyGoalWords > 0 ? Math.min(100, Math.round((wordsLearnedToday / dailyGoalWords) * 100)) : 0

  return { wordsLearnedToday, dailyGoalWords, progress, isLoading, refetch: fetch }
}
