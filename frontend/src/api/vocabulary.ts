import { apiRequest } from './client'

export type WordStatus = 'new' | 'learning' | 'recalling' | 'long_term_memory'

export interface VocabularyWord {
  id: number
  word_en: string
  transcription_en: string
  translation_ru: string
  image_url: string
  status: WordStatus
  next_recall: string | null
}

export interface VocabularyResponse {
  total: number
  page: number
  words: VocabularyWord[]
}

export function getVocabulary(): Promise<VocabularyResponse> {
  return apiRequest<VocabularyResponse>('/vocabulary')
}
