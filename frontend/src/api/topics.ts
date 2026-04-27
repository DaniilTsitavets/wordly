import { apiRequest } from './client'

export interface TopicSummary {
  id: number
  name: string
  description: string
  image_url: string
  sort_order: number
  subtopics_total: number
  subtopics_completed: number
}

export interface TopicsResponse {
  topics: TopicSummary[]
}

export interface SubtopicSummary {
  id: number
  name: string
  description: string
  image_url: string
  sort_order: number
  words_count: number
  disabled_mechanics: string[]
  status: 'locked' | 'unblocked' | 'in_progress' | 'completed'
}

export function getTopics(): Promise<TopicsResponse> {
  return apiRequest<TopicsResponse>('/topics')
}

export function getTopicSubtopicIds(topicId: number): Promise<number[]> {
  return apiRequest<{ subtopic_ids: number[] }>(`/topics/${topicId}`).then(
    (res) => res.subtopic_ids
  )
}

export function getSubtopicsBatch(ids: number[]): Promise<SubtopicSummary[]> {
  return apiRequest<SubtopicSummary[]>('/subtopics/batch', {
    method: 'POST',
    body: { ids },
  })
}

export type MechanicType =
  | 'mnemonic_cards'
  | 'flashcards'
  | 'matching'
  | 'filling_gaps'
  | 'word_builder'

export type LevelStatus = 'locked' | 'unblocked' | 'in_progress' | 'completed'

export interface LevelProgress {
  mechanic_type: MechanicType
  status: LevelStatus
  started_at: string | null
  completed_at: string | null
}

export interface SubtopicDetail {
  id: number
  name: string
  description: string
  image_url: string
  words_count: number
  disabled_mechanics: MechanicType[]
  levels: LevelProgress[]
}

export function getSubtopic(id: number): Promise<SubtopicDetail> {
  return apiRequest<SubtopicDetail>(`/subtopics/${id}`)
}
