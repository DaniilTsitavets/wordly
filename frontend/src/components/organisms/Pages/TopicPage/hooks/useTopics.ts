import { useEffect, useState } from 'react'
import type { TopicApi, TTopic, TopicsResponse } from '../types/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const mapTopic = (api: TopicApi): TTopic => ({
  id: api.id,
  title: api.name,
  description: api.description,
  image: api.image_url,
  progress: {
    total: api.subtopics_total,
    completed: api.subtopics_completed,
  },
})

export function useTopics(): {
  topics: TTopic[] | null
  isLoading: boolean
  error: string | null
} {
  const [topics, setTopics] = useState<TTopic[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`${API_BASE_URL}/topics`)
        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.statusText}`)
        }

        const data: TopicsResponse = await response.json()
        const mappedTopics = data.topics.map(mapTopic)

        setTopics(mappedTopics)
      } catch (error) {
        setError((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [])

  return { topics, isLoading, error }
}
