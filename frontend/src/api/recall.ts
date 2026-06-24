import { apiRequest } from './client'

export type RecallInterval = 1 | 3 | 7 | 14 | 21 | 30

export interface RecallWord {
  id: number
  word_en: string
  translation_ru: string
  transcription_en: string
  recall_interval: RecallInterval
}

export interface RecallResponse {
  total: number
  words: RecallWord[]
}

export function getRecall(): Promise<RecallResponse> {
  return apiRequest<RecallResponse>('/recall')
}

export interface RecallAnswerResponse {
  word_id: number
  is_correct: boolean
  correct_answer: string
}

export function recallAnswer(
  wordId: number,
  userAnswer: string,
  recallTimeMs?: number
): Promise<RecallAnswerResponse> {
  return apiRequest<RecallAnswerResponse>('/recall/answer', {
    method: 'POST',
    body: {
      word_id: wordId,
      user_answer: userAnswer,
      ...(recallTimeMs != null ? { recall_time_ms: recallTimeMs } : {}),
    },
  })
}

export interface RecallCompleteResponse {
  total_words: number
  correct: number
  failed: number
  gems_earned: number
}

export function recallComplete(): Promise<RecallCompleteResponse> {
  return apiRequest<RecallCompleteResponse>('/recall/complete', {
    method: 'POST',
    body: {},
  })
}
