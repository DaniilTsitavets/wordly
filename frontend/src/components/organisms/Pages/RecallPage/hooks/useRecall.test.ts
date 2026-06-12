import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useRecall } from './useRecall'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('useRecall', () => {
  it('loads the recall queue on mount', async () => {
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 0, words: [] })))

    const { result } = renderHook(() => useRecall())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ total: 0, words: [] })
    expect(result.current.error).toBeNull()
  })

  it('sets error on failure', async () => {
    server.use(
      http.get(url('/recall'), () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    )

    const { result } = renderHook(() => useRecall())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('fail')
    expect(result.current.data).toBeNull()
  })
})
