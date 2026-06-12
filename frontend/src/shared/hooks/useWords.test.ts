import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useWords } from './useWords'

const url = (path: string) => `${API_BASE_URL}${path}`

const word = {
  id: 1,
  word_en: 'apple',
  transcription_en: '[ˈæpəl]',
  translation_ru: 'яблоко',
  image_url: 'http://img/apple.png',
  has_mnemonic: true,
}

describe('useWords', () => {
  it('loads words for the given subtopic', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))

    const { result } = renderHook(() => useWords(5))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.words).toEqual([word])
    expect(result.current.error).toBeNull()
  })

  it('sets error on API failure', async () => {
    server.use(
      http.get(url('/subtopics/9/words'), () =>
        HttpResponse.json({ message: 'no words' }, { status: 500 })
      )
    )

    const { result } = renderHook(() => useWords(9))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('no words')
    expect(result.current.words).toEqual([])
  })

  it('refetches when subtopicId changes', async () => {
    server.use(
      http.get(url('/subtopics/1/words'), () =>
        HttpResponse.json({ words: [{ ...word, id: 1, word_en: 'one' }] })
      ),
      http.get(url('/subtopics/2/words'), () =>
        HttpResponse.json({ words: [{ ...word, id: 2, word_en: 'two' }] })
      )
    )

    const { result, rerender } = renderHook(({ id }: { id: number }) => useWords(id), {
      initialProps: { id: 1 },
    })
    await waitFor(() => expect(result.current.words[0]?.word_en).toBe('one'))

    rerender({ id: 2 })
    await waitFor(() => expect(result.current.words[0]?.word_en).toBe('two'))
  })
})
