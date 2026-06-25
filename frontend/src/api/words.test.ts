import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { getSubtopicWords, type WordDetails } from './words'

const url = (path: string) => `${API_BASE_URL}${path}`

const word: WordDetails = {
  id: 1,
  word_en: 'apple',
  transcription_en: '[ˈæpəl]',
  translation_ru: 'яблоко',
  image_url: 'http://img/apple.png',
  has_mnemonic: true,
  mnemonic_image_url: 'http://img/mnemonic.png',
  mnemonic_text: 'a-pull',
}

describe('words API', () => {
  it('getSubtopicWords unwraps the .words field from the response', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    await expect(getSubtopicWords(5)).resolves.toEqual([word])
  })

  it('returns an empty array when the API has no words for the subtopic', async () => {
    server.use(http.get(url('/subtopics/99/words'), () => HttpResponse.json({ words: [] })))
    await expect(getSubtopicWords(99)).resolves.toEqual([])
  })

  it('propagates server errors', async () => {
    server.use(
      http.get(url('/subtopics/1/words'), () =>
        HttpResponse.json({ message: 'not found' }, { status: 404 })
      )
    )
    await expect(getSubtopicWords(1)).rejects.toThrow('not found')
  })
})
