import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useTopicDetail } from './useTopicDetail'

const url = (path: string) => `${API_BASE_URL}${path}`

const subtopic = {
  id: 10,
  name: 'Drinks',
  description: 'd',
  image_url: 'http://img/d.png',
  sort_order: 1,
  words_count: 5,
  disabled_mechanics: [],
  status: 'unblocked' as const,
  completed_mechanics_count: 0,
  total_mechanics_count: 5,
}

describe('useTopicDetail', () => {
  it('fetches subtopic ids then resolves the batch', async () => {
    let batchBody: unknown = null
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [10, 11] })),
      http.post(url('/subtopics/batch'), async ({ request }) => {
        batchBody = await request.json()
        return HttpResponse.json([subtopic, { ...subtopic, id: 11 }])
      })
    )

    const { result } = renderHook(() => useTopicDetail(1))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(batchBody).toEqual({ ids: [10, 11] })
    expect(result.current.subtopics).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('sets error if the first request fails', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ message: 'no topic' }, { status: 404 }))
    )

    const { result } = renderHook(() => useTopicDetail(1))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('no topic')
  })
})
