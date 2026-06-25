interface SubtopicApiModel {
  id: number
  name: string
  description: string
  image_url: string
  words_count: number
}

interface TopicSectionProps {
  topicId: number
  topicTitle: string
  topicDescription: string
}

// ─── GET /topics/{topicId} ───────────────────────────────────────────────────

type SubtopicApi = {
  id: number
  name: string
  description: string
  image_url: string
  sort_order: number
  words_count: number
  disabled_mechanics: string[]
  status: 'locked' | 'unblocked' | 'in_progress' | 'completed'
  completed_mechanics_count: number
  total_mechanics_count: number
}

type TopicDetailResponse = {
  id: number
  name: string
  description: string
  image_url: string
  subtopics: SubtopicApi[]
}

export type { SubtopicApiModel, TopicSectionProps, SubtopicApi, TopicDetailResponse }
