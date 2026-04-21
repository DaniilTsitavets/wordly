import type { SubtopicApiModel } from '@/components/molecules/TopicsSection/types/types'

// ─── GET /topics ─────────────────────────────────────────────────────────────

export type TopicApi = {
  id: number
  name: string
  description: string
  image_url: string
  sort_order: number
  subtopics_total: number
  subtopics_completed: number
}

export type TopicsResponse = {
  topics: TopicApi[]
  current_position: {
    subtopic_id: number
    mechanic_type: string
  }
}

// ─── Frontend models ─────────────────────────────────────────────────────────

export type TTopic = {
  id: number
  title: string
  description: string
  image: string
  progress: {
    total: number
    completed: number
  }
}

export type { SubtopicApiModel }
