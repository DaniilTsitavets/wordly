import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useSubtopic } from './useSubtopic'

const url = (path: string) => `${API_BASE_URL}${path}`

const detail = {
  id: 10,
  name: 'Drinks',
  description: 'd',
  image_url: 'http://img/d.png',
  words_count: 5,
  disabled_mechanics: [],
  levels: [],
}

describe('useSubtopic', () => {
  it('loads subtopic detail by id', async () => {
    server.use(http.get(url('/subtopics/10'), () => HttpResponse.json(detail)))

    const { result } = renderHook(() => useSubtopic(10))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.subtopic).toEqual(detail)
    expect(result.current.error).toBeNull()
  })

  it('sets error on failure', async () => {
    server.use(
      http.get(url('/subtopics/99'), () =>
        HttpResponse.json({ message: 'not found' }, { status: 404 })
      )
    )

    const { result } = renderHook(() => useSubtopic(99))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('not found')
  })

  it('refetch() re-runs the request', async () => {
    let count = 0
    server.use(
      http.get(url('/subtopics/10'), () => {
        count++
        return HttpResponse.json({ ...detail, words_count: count })
      })
    )

    const { result } = renderHook(() => useSubtopic(10))
    await waitFor(() => expect(result.current.subtopic?.words_count).toBe(1))

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => expect(result.current.subtopic?.words_count).toBe(2))
  })

  it('refetches when subtopicId changes', async () => {
    server.use(
      http.get(url('/subtopics/1'), () => HttpResponse.json({ ...detail, id: 1 })),
      http.get(url('/subtopics/2'), () => HttpResponse.json({ ...detail, id: 2 }))
    )

    const { result, rerender } = renderHook(({ id }: { id: number }) => useSubtopic(id), {
      initialProps: { id: 1 },
    })
    await waitFor(() => expect(result.current.subtopic?.id).toBe(1))

    rerender({ id: 2 })
    await waitFor(() => expect(result.current.subtopic?.id).toBe(2))
  })
})
