import { useEffect, useState } from 'react'
import { getVocabulary } from '@/api/vocabulary'
import type { VocabularyResponse } from '@/api/vocabulary'
import { getTopics } from '@/api/topics'
import type { TopicSummary } from '@/api/topics'

interface UseVocabularyResult {
  data: VocabularyResponse | null
  totalWords: number
  topics: TopicSummary[]
  selectedTopicId: number | null
  setSelectedTopicId: (id: number | null) => void
  isLoading: boolean
  error: string | null
}

export function useVocabulary(): UseVocabularyResult {
  const [data, setData] = useState<VocabularyResponse | null>(null)
  const [totalWords, setTotalWords] = useState(0)
  const [allTopics, setAllTopics] = useState<TopicSummary[]>([])
  const [availableTopicIds, setAvailableTopicIds] = useState<Set<number>>(new Set())
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTopics()
      .then((res) => setAllTopics(res.topics))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await getVocabulary(selectedTopicId ?? undefined)
        if (!cancelled) {
          setData(res)
          if (selectedTopicId === null) {
            setTotalWords(res.total)
            setAvailableTopicIds(new Set(res.words.map((w) => w.topic_id)))
          }
        }
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
  }, [selectedTopicId])

  const topics = allTopics.filter((t) => availableTopicIds.has(t.id))

  return { data, totalWords, topics, selectedTopicId, setSelectedTopicId, isLoading, error }
}
