import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { getRecall, recallAnswer, recallComplete } from './recall'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('recall API', () => {
  describe('getRecall', () => {
    it('returns the recall queue', async () => {
      server.use(
        http.get(url('/recall'), () =>
          HttpResponse.json({
            total: 2,
            words: [
              {
                id: 1,
                word_en: 'apple',
                translation_ru: 'яблоко',
                interval_days: 3,
                next_recall: '2026-06-15',
              },
              {
                id: 2,
                word_en: 'pear',
                translation_ru: 'груша',
                interval_days: 7,
                next_recall: '2026-06-20',
              },
            ],
          })
        )
      )

      const result = await getRecall()
      expect(result.total).toBe(2)
      expect(result.words).toHaveLength(2)
    })
  })

  describe('recallAnswer', () => {
    it('POSTs { word_id, user_answer } in snake_case', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/recall/answer'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({
            word_id: 1,
            is_correct: true,
            correct_answer: 'apple',
          })
        })
      )

      const result = await recallAnswer(1, 'apple')
      expect(receivedBody).toEqual({ word_id: 1, user_answer: 'apple' })
      expect(result.is_correct).toBe(true)
      expect(result.correct_answer).toBe('apple')
    })

    it('returns is_correct: false with the expected answer when wrong', async () => {
      server.use(
        http.post(url('/recall/answer'), () =>
          HttpResponse.json({ word_id: 1, is_correct: false, correct_answer: 'apple' })
        )
      )

      const result = await recallAnswer(1, 'appel')
      expect(result.is_correct).toBe(false)
      expect(result.correct_answer).toBe('apple')
    })
  })

  describe('recallComplete', () => {
    it('POSTs empty body and returns the session summary', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/recall/complete'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({
            total_words: 5,
            correct: 4,
            failed: 1,
            gems_earned: 8,
          })
        })
      )

      const result = await recallComplete()
      expect(receivedBody).toEqual({})
      expect(result.total_words).toBe(5)
      expect(result.correct).toBe(4)
      expect(result.failed).toBe(1)
      expect(result.gems_earned).toBe(8)
    })
  })
})
