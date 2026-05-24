interface SubtopicCardData {
  id: number
  title: string
  imageUrl: string
  description: string
  wordCount: number
  topicTitle: string
  status: 'locked' | 'unblocked' | 'in_progress' | 'completed'
  completedMechanicsCount: number
  totalMechanicsCount: number
}

export type { SubtopicCardData }
