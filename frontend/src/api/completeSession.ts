import { apiRequest } from './client'

export interface LevelCompleteResult {
  mechanic_type: string
  gems_earned: number
  next_mechanic: string | null
  subtopic_completed: boolean
}

export function completeSession(
  subtopicId: number,
  mechanicType: string
): Promise<LevelCompleteResult> {
  return apiRequest<LevelCompleteResult>(`/subtopics/${subtopicId}/session/complete`, {
    method: 'POST',
    body: { mechanic_type: mechanicType },
  })
}
