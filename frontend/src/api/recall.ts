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
