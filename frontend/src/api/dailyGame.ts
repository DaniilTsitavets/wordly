import { apiRequest } from './client'

export interface DailyGameData {
  id: number
  idiom: string
  options: string[]
}

export interface DailyGameAnswerResponse {
  is_correct: boolean
  correct_option: number
}

export function getDailyGame(): Promise<DailyGameData> {
  return apiRequest<DailyGameData>('/daily-game')
}

export function submitDailyGameAnswer(
  daily_game_id: number,
  selected_option: number
): Promise<DailyGameAnswerResponse> {
  return apiRequest<DailyGameAnswerResponse>('/daily-game/answer', {
    method: 'POST',
    body: { daily_game_id, selected_option },
  })
}
