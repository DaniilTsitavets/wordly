import { useCallback, useState } from 'react'
import { completeSession } from '@/api/completeSession'
import { claimDailyGoal, getMe } from '@/api/user'
import { useAppDispatch } from '@/store/hooks'
import { addGems, setUser } from '@/store/slices/authSlice'

interface FinishSessionResult {
  gemsEarned: number
  dailyGoalReached: boolean
  dailyGoalGemsAwarded: number
}

export function useFinishSession() {
  const dispatch = useAppDispatch()
  const [isCompleting, setIsCompleting] = useState(false)

  const finishSession = useCallback(
    async (subtopicId: number, mechanicType: string): Promise<FinishSessionResult> => {
      setIsCompleting(true)
      try {
        const sessionResult = await completeSession(subtopicId, mechanicType)
        dispatch(addGems(sessionResult.gems_earned))

        const claim = await claimDailyGoal()
        if (claim.gems_awarded > 0) {
          dispatch(addGems(claim.gems_awarded))
        }

        if (claim.reached) {
          const freshProfile = await getMe()
          dispatch(setUser(freshProfile))
        }

        return {
          gemsEarned: sessionResult.gems_earned,
          dailyGoalReached: claim.reached,
          dailyGoalGemsAwarded: claim.gems_awarded,
        }
      } finally {
        setIsCompleting(false)
      }
    },
    [dispatch]
  )

  return { finishSession, isCompleting }
}
