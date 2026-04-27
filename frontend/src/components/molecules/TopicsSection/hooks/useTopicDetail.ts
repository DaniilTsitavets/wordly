import { useEffect, useState } from 'react'
import { getTopicSubtopicIds, getSubtopicsBatch } from '@/api/topics'
import type { SubtopicApi } from '../types/types'

export function useTopicDetail(topicId: number): {
  subtopics: SubtopicApi[] | null
  isLoading: boolean
  error: string | null
} {
  const [subtopics, setSubtopics] = useState<SubtopicApi[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubtopics = async () => {
      try {
        setIsLoading(true)
        const ids = await getTopicSubtopicIds(topicId)
        const data = await getSubtopicsBatch(ids)
        setSubtopics(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubtopics()
  }, [topicId])

  return { subtopics, isLoading, error }
}
