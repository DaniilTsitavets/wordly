import type { SubtopicApiModel } from '@/components/molecules/TopicsSection/types/types'

interface TopicApiResponse {
  id: number
  name: string
  description: string
  subtopics: SubtopicApiModel[]
}

export type { TopicApiResponse }
