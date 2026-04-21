import { useEffect, useState } from 'react'
import type { SubtopicApiModel } from '@/components/molecules/TopicsSection/types/types'
import type { TopicApiResponse } from './types/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4010/api/v1'

interface TopicData {
  title: string
  description: string
  subtopics: SubtopicApiModel[]
  isLoading: boolean
  error: string | null
}

const FALLBACK_TITLE = 'Subtopics'
const FALLBACK_DESCRIPTION = 'Choose a subtopic and start learning.'

export function useTopicData(topicId: string): TopicData {
  const [title, setTitle] = useState(FALLBACK_TITLE)
  const [description, setDescription] = useState(FALLBACK_DESCRIPTION)
  const [subtopics, setSubtopics] = useState<SubtopicApiModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    const loadTopic = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error('Не удалось загрузить тему с сабтопиками')
        }

        const data = (await response.json()) as TopicApiResponse

        setTitle(data.name)
        setDescription(data.description)
        setSubtopics(data.subtopics)
      } catch (loadError) {
        if (abortController.signal.aborted) return

        const fallbackMessage = 'Не удалось загрузить список сабтопиков. Попробуйте снова позже.'
        setError(loadError instanceof Error ? loadError.message : fallbackMessage)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadTopic()

    return () => {
      abortController.abort()
    }
  }, [topicId])

  return { title, description, subtopics, isLoading, error }
}
