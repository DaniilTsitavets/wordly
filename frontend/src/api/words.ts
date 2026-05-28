import { apiRequest } from './client'

export interface WordDetails {
  id: number
  word_en: string
  transcription_en: string
  translation_ru: string
  image_url: string
  has_mnemonic: boolean
  mnemonic_image_url?: string | null
  mnemonic_text?: string | null
  usage_example_en?: string
  usage_example_ru?: string
}

interface WordsResponse {
  words: WordDetails[]
}

export function getSubtopicWords(subtopicId: number): Promise<WordDetails[]> {
  return apiRequest<WordsResponse>(`/subtopics/${subtopicId}/words`).then((res) => res.words)
}
