import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useTopics } from './useTopics'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic = {
  id: 1,
  name: 'Food',
  description: 'd',
  image_url: 'http://img/food.png',
  sort_order: 1,
  subtopics_total: 3,
  subtopics_completed: 1,
}

describe('HomePage useTopics', () => {
  it('returns the topics array on success', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [topic] })))

    const { result } = renderHook(() => useTopics())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.topics).toEqual([topic])
    expect(result.current.error).toBeNull()
  })

  it('sets error on failure', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    )

    const { result } = renderHook(() => useTopics())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('fail')
    expect(result.current.topics).toBeNull()
  })
})
