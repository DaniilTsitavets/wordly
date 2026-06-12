import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { getDailyGame, submitDailyGameAnswer } from './dailyGame'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('dailyGame API', () => {
  describe('getDailyGame', () => {
    it('returns the daily game payload', async () => {
      server.use(
        http.get(url('/daily-game'), () =>
          HttpResponse.json({ id: 42, idiom: 'kick the bucket', options: ['a', 'b', 'c'] })
        )
      )

      const result = await getDailyGame()
      expect(result.id).toBe(42)
      expect(result.idiom).toBe('kick the bucket')
      expect(result.options).toEqual(['a', 'b', 'c'])
    })
  })

  describe('submitDailyGameAnswer', () => {
    it('POSTs { daily_game_id, selected_option } in snake_case', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/daily-game/answer'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ is_correct: true, correct_option: 1 })
        })
      )

      const result = await submitDailyGameAnswer(42, 1)
      expect(receivedBody).toEqual({ daily_game_id: 42, selected_option: 1 })
      expect(result.is_correct).toBe(true)
      expect(result.correct_option).toBe(1)
    })

    it('returns is_correct: false when the answer is wrong', async () => {
      server.use(
        http.post(url('/daily-game/answer'), () =>
          HttpResponse.json({ is_correct: false, correct_option: 2 })
        )
      )
      const result = await submitDailyGameAnswer(42, 0)
      expect(result.is_correct).toBe(false)
      expect(result.correct_option).toBe(2)
    })
  })
})
