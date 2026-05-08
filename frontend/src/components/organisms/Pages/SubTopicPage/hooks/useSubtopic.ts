import { useCallback, useEffect, useState } from 'react'
import { getSubtopic } from '@/api/topics'
import type { SubtopicDetail } from '@/api/topics'

export function useSubtopic(subtopicId: number): {
  subtopic: SubtopicDetail | null
  isLoading: boolean
  error: string | null
  refetch: () => void
} {
  const [subtopic, setSubtopic] = useState<SubtopicDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getSubtopic(subtopicId)
        if (!cancelled) setSubtopic(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load subtopic')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [subtopicId, refreshKey])

  return { subtopic, isLoading, error, refetch }
}
