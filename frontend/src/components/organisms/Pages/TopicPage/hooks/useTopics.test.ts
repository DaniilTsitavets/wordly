import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useTopics, mapTopic } from './useTopics'

const url = (path: string) => `${API_BASE_URL}${path}`

const apiTopic = {
  id: 1,
  name: 'Food',
  description: 'About food',
  image_url: 'http://img/food.png',
  sort_order: 1,
  subtopics_total: 3,
  subtopics_completed: 1,
}

describe('TopicPage mapTopic', () => {
  it('maps snake_case API shape to camel-style TTopic with progress object', () => {
    expect(mapTopic(apiTopic)).toEqual({
      id: 1,
      title: 'Food',
      description: 'About food',
      image: 'http://img/food.png',
      progress: { total: 3, completed: 1 },
    })
  })
})

describe('TopicPage useTopics', () => {
  it('loads + maps topics to TTopic[]', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [apiTopic] })))

    const { result } = renderHook(() => useTopics())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.topics).toEqual([
      {
        id: 1,
        title: 'Food',
        description: 'About food',
        image: 'http://img/food.png',
        progress: { total: 3, completed: 1 },
      },
    ])
  })

  it('sets error on failure', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    )
    const { result } = renderHook(() => useTopics())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('fail')
  })
})
