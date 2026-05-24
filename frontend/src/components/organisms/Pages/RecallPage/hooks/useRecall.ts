import { useEffect, useState } from 'react'
import { getRecall } from '@/api/recall'
import type { RecallResponse } from '@/api/recall'

interface UseRecallResult {
  data: RecallResponse | null
  isLoading: boolean
  error: string | null
}

export function useRecall(): UseRecallResult {
  const [data, setData] = useState<RecallResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await getRecall()
        if (!cancelled) setData(res)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load recall')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, error }
}
