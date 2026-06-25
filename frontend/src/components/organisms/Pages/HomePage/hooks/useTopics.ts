import { useEffect, useState } from 'react'
import { getTopics } from '@/api/topics'
import type { TopicSummary } from '@/api/topics'

export function useTopics(): {
  topics: TopicSummary[] | null
  isLoading: boolean
  error: string | null
} {
  const [topics, setTopics] = useState<TopicSummary[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setIsLoading(true)
        const data = await getTopics()
        if (!cancelled) setTopics(data.topics)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load topics')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [])

  return { topics, isLoading, error }
}
