import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useVocabulary } from './useVocabulary'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('useVocabulary', () => {
  it('loads the vocabulary response on mount', async () => {
    server.use(
      http.get(url('/vocabulary'), () => HttpResponse.json({ total: 1, page: 1, words: [] }))
    )

    const { result } = renderHook(() => useVocabulary())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ total: 1, page: 1, words: [] })
    expect(result.current.error).toBeNull()
  })

  it('sets error on failure', async () => {
    server.use(
      http.get(url('/vocabulary'), () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    )

    const { result } = renderHook(() => useVocabulary())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('fail')
    expect(result.current.data).toBeNull()
  })
})
