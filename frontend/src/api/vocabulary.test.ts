import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { getVocabulary, type VocabularyWord } from './vocabulary'

const url = (path: string) => `${API_BASE_URL}${path}`

const word: VocabularyWord = {
  id: 1,
  word_en: 'apple',
  transcription_en: '[ˈæpəl]',
  translation_ru: 'яблоко',
  image_url: 'http://img/apple.png',
  status: 'learning',
  next_recall: '2026-06-12',
}

describe('vocabulary API', () => {
  it('GETs /vocabulary and returns the paginated response', async () => {
    server.use(
      http.get(url('/vocabulary'), () => HttpResponse.json({ total: 1, page: 1, words: [word] }))
    )

    const result = await getVocabulary()
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.words).toEqual([word])
  })

  it('supports empty vocabulary', async () => {
    server.use(
      http.get(url('/vocabulary'), () => HttpResponse.json({ total: 0, page: 1, words: [] }))
    )
    const result = await getVocabulary()
    expect(result.words).toEqual([])
    expect(result.total).toBe(0)
  })
})
