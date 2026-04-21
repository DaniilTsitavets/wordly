import { useEffect, useState } from 'react'
import type { TopicDetailResponse, SubtopicApi } from '../types/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function useTopicDetail(topicId: number): {
  subtopics: SubtopicApi[] | null
  isLoading: boolean
  error: string | null
} {
  const [subtopics, setSubtopics] = useState<SubtopicApi[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopicDetail = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`${API_BASE_URL}/topics/${topicId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch topic ${topicId}: ${response.statusText}`)
        }

        const data: TopicDetailResponse = await response.json()
        setSubtopics(data.subtopics)
      } catch (error) {
        setError((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopicDetail()
  }, [topicId])

  return { subtopics, isLoading, error }
}
