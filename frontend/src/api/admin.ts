import { apiRequest } from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminTopic {
  id: number
  name: string
  description: string | null
  image_url: string | null
  sort_order: number | null
  subtopics_count: number
}

export interface AdminSubtopic {
  id: number
  topic_id: number
  name: string
  description: string | null
  image_url: string | null
  sort_order: number | null
  words_count: number
  disabled_mechanics: string[]
}

export interface AdminWord {
  id: number
  subtopic_id: number
  word_en: string
  transcription_en: string | null
  translation_ru: string
  image_url: string | null
  usage_example_en: string | null
  usage_example_en_translation_ru: string | null
  mnemonic_image_url: string | null
  mnemo_text: string | null
}

// ─── Create Payloads ─────────────────────────────────────────────────────────

export interface CreateTopicPayload {
  name: string
  description?: string
  image_url?: string
  sort_order?: number
}

export interface CreateSubtopicPayload {
  topic_id: number
  name: string
  description?: string
  image_url?: string
  sort_order?: number
  disabled_mechanics?: string[]
}

export interface CreateWordPayload {
  subtopic_id: number
  word_en: string
  translation_ru: string
  transcription_en?: string
  image_url?: string
  usage_example_en?: string
  usage_example_en_translation_ru?: string
  mnemonic_image_url?: string | null
  mnemo_text?: string | null
}

// ─── API Functions ───────────────────────────────────────────────────────────

// Topics
export function getAdminTopics(): Promise<AdminTopic[]> {
  return apiRequest<AdminTopic[]>('/admin/topics')
}

export function createAdminTopic(payload: CreateTopicPayload): Promise<AdminTopic> {
  return apiRequest<AdminTopic>('/admin/topics', { method: 'POST', body: payload })
}

export function updateAdminTopic(
  topicId: number,
  payload: CreateTopicPayload
): Promise<AdminTopic> {
  return apiRequest<AdminTopic>(`/admin/topics/${topicId}`, { method: 'PUT', body: payload })
}

export function deleteAdminTopic(topicId: number): Promise<void> {
  return apiRequest<void>(`/admin/topics/${topicId}`, { method: 'DELETE' })
}

// Subtopics
export function getAdminSubtopics(topicId: number): Promise<AdminSubtopic[]> {
  return apiRequest<AdminSubtopic[]>(`/admin/subtopics?topic_id=${topicId}`)
}

export function createAdminSubtopic(payload: CreateSubtopicPayload): Promise<AdminSubtopic> {
  return apiRequest<AdminSubtopic>('/admin/subtopics', { method: 'POST', body: payload })
}

export function updateAdminSubtopic(
  subtopicId: number,
  payload: CreateSubtopicPayload
): Promise<AdminSubtopic> {
  return apiRequest<AdminSubtopic>(`/admin/subtopics/${subtopicId}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteAdminSubtopic(subtopicId: number): Promise<void> {
  return apiRequest<void>(`/admin/subtopics/${subtopicId}`, { method: 'DELETE' })
}

// Words
export function getAdminWords(subtopicId: number): Promise<AdminWord[]> {
  return apiRequest<AdminWord[]>(`/admin/words?subtopic_id=${subtopicId}`)
}

export function createAdminWord(payload: CreateWordPayload): Promise<AdminWord> {
  return apiRequest<AdminWord>('/admin/words', { method: 'POST', body: payload })
}

export function updateAdminWord(wordId: number, payload: CreateWordPayload): Promise<AdminWord> {
  return apiRequest<AdminWord>(`/admin/words/${wordId}`, { method: 'PUT', body: payload })
}

export function deleteAdminWord(wordId: number): Promise<void> {
  return apiRequest<void>(`/admin/words/${wordId}`, { method: 'DELETE' })
}
