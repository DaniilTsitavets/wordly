import { useEffect, useState } from 'react'
import { getTopics } from '@/api/topics'
import type { TTopic, TopicApi } from '../types/types'

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
        const data = await getTopics()
        setTopics(data.topics.map(mapTopic))
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [])

  return { topics, isLoading, error }
}
