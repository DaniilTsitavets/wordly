import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useVocabulary } from './useVocabulary'

const url = (path: string) => `${API_BASE_URL}${path}`

const topicsResponse = {
  topics: [
    {
      id: 1,
      name: 'Food & Drinks',
      description: '',
      image_url: '',
      sort_order: 1,
      subtopics_total: 2,
      subtopics_completed: 0,
    },
    {
      id: 2,
      name: 'Numbers',
      description: '',
      image_url: '',
      sort_order: 2,
      subtopics_total: 1,
      subtopics_completed: 0,
    },
  ],
}

const wordTopic1 = {
  id: 1,
  topic_id: 1,
  word_en: 'apple',
  transcription_en: 'ˈæpəl',
  translation_ru: 'яблоко',
  image_url: '',
  status: 'learning',
  next_recall: null,
}

describe('useVocabulary', () => {
  it('loads the vocabulary response on mount', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () => HttpResponse.json({ total: 1, page: 1, words: [] }))
    )

    const { result } = renderHook(() => useVocabulary())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ total: 1, page: 1, words: [] })
    expect(result.current.totalWords).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error on failure', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    )

    const { result } = renderHook(() => useVocabulary())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('fail')
    expect(result.current.data).toBeNull()
  })

  it('exposes only topics that have vocabulary words', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () =>
        HttpResponse.json({ total: 1, page: 1, words: [wordTopic1] })
      )
    )

    const { result } = renderHook(() => useVocabulary())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.topics).toHaveLength(1)
    expect(result.current.topics[0].id).toBe(1)
  })
})
