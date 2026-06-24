import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useDailyProgress } from './useDailyProgress'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('useDailyProgress', () => {
  it('starts in loading state and resolves with progress data', async () => {
    server.use(
      http.get(url('/users/me/daily-progress'), () =>
        HttpResponse.json({ minutes_today: 4, daily_goal_min: 8 })
      )
    )

    const { result } = renderHook(() => useDailyProgress())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.minutesToday).toBe(4)
    expect(result.current.dailyGoalMin).toBe(8)
    expect(result.current.progress).toBe(50)
  })

  it('caps progress at 100 even when learned > goal', async () => {
    server.use(
      http.get(url('/users/me/daily-progress'), () =>
        HttpResponse.json({ minutes_today: 20, daily_goal_min: 8 })
      )
    )

    const { result } = renderHook(() => useDailyProgress())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.progress).toBe(100)
  })

  it('falls back to defaults (0 / 10 / 0) on API error', async () => {
    server.use(
      http.get(url('/users/me/daily-progress'), () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 })
      )
    )

    const { result } = renderHook(() => useDailyProgress())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.minutesToday).toBe(0)
    expect(result.current.dailyGoalMin).toBe(10)
    expect(result.current.progress).toBe(0)
  })

  it('refetches on demand', async () => {
    let count = 0
    server.use(
      http.get(url('/users/me/daily-progress'), () => {
        count++
        return HttpResponse.json({ minutes_today: count, daily_goal_min: 10 })
      })
    )

    const { result } = renderHook(() => useDailyProgress())
    await waitFor(() => expect(result.current.minutesToday).toBe(1))

    await act(async () => {
      await result.current.refetch()
    })
    expect(result.current.minutesToday).toBe(2)
  })
})
