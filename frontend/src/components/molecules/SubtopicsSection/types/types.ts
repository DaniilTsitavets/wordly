interface SubtopicApiModel {
  id: number
  name: string
  description: string
  image_url: string
  words_count: number
}

interface SubtopicsSectionProps {
  topicTitle: string
  topicDescription: string
  subtopics: SubtopicApiModel[]
  isLoading?: boolean
  error?: string | null
}

export type { SubtopicApiModel, SubtopicsSectionProps }
