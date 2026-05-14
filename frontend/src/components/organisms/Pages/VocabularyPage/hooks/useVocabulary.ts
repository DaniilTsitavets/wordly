import { useEffect, useState } from 'react'
import { getVocabulary } from '@/api/vocabulary'
import type { VocabularyResponse } from '@/api/vocabulary'

interface UseVocabularyResult {
  data: VocabularyResponse | null
  isLoading: boolean
  error: string | null
}

export function useVocabulary(): UseVocabularyResult {
  const [data, setData] = useState<VocabularyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await getVocabulary()
        if (!cancelled) setData(res)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load vocabulary')
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
