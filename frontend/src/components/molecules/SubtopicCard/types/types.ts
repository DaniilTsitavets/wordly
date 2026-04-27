interface SubtopicCardData {
  id: number
  title: string
  imageUrl: string
  description: string
  wordCount: number
  topicTitle: string
  status: 'locked' | 'unblocked' | 'in_progress' | 'completed'
}

export type { SubtopicCardData }
