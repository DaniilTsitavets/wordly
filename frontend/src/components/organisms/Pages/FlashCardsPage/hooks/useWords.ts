import { getSubtopicWords, type WordDetails } from '@/api/words'
import { useEffect, useState } from 'react'

export function useWords(subtopicId: number) {
  const [words, setWords] = useState<WordDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setIsLoading(true)
        const data = await getSubtopicWords(subtopicId)
        setWords(Array.isArray(data) ? data : [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWords()
  }, [subtopicId])

  return { words, isLoading, error }
}
