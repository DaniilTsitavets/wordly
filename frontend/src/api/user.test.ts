import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { getMe, updateMe, getDailyProgress, claimDailyGoal } from './user'
import { mockUser } from '@/test/handlers'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('user API', () => {
  describe('getMe', () => {
    it('returns the current user profile', async () => {
      await expect(getMe()).resolves.toEqual(mockUser)
    })
  })

  describe('updateMe', () => {
    it('PUTs the partial payload and returns the updated user', async () => {
      let receivedMethod = ''
      let receivedBody: unknown = null
      server.use(
        http.put(url('/users/me'), async ({ request }) => {
          receivedMethod = request.method
          receivedBody = await request.json()
          return HttpResponse.json({ ...mockUser, name: 'Updated' })
        })
      )

      const result = await updateMe({ name: 'Updated' })
      expect(receivedMethod).toBe('PUT')
      expect(receivedBody).toEqual({ name: 'Updated' })
      expect(result.name).toBe('Updated')
    })

    it('forwards password when changing it', async () => {
      let receivedBody: unknown = null
      server.use(
        http.put(url('/users/me'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json(mockUser)
        })
      )

      await updateMe({ password: 'new-secret' })
      expect(receivedBody).toEqual({ password: 'new-secret' })
    })
  })

  describe('getDailyProgress', () => {
    it('returns minutes_today + daily_goal_min', async () => {
      server.use(
        http.get(url('/users/me/daily-progress'), () =>
          HttpResponse.json({ minutes_today: 3, daily_goal_min: 8 })
        )
      )

      const result = await getDailyProgress()
      expect(result.minutes_today).toBe(3)
      expect(result.daily_goal_min).toBe(8)
    })
  })

  describe('claimDailyGoal', () => {
    it('POSTs an empty body and returns the claim result', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/users/me/daily-goal/claim'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ reached: true, gems_awarded: 50 })
        })
      )

      const result = await claimDailyGoal()
      expect(receivedBody).toEqual({})
      expect(result.reached).toBe(true)
      expect(result.gems_awarded).toBe(50)
    })

    it('returns reached: false + 0 gems when the goal was not met', async () => {
      server.use(
        http.post(url('/users/me/daily-goal/claim'), () =>
          HttpResponse.json({ reached: false, gems_awarded: 0 })
        )
      )

      const result = await claimDailyGoal()
      expect(result.reached).toBe(false)
      expect(result.gems_awarded).toBe(0)
    })
  })
})
