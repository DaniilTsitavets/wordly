import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useActivityHeartbeat } from './useActivityHeartbeat'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('useActivityHeartbeat', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('flushes accumulated visible time and invokes onProgress with the response', async () => {
    let receivedSeconds: number | null = null
    server.use(
      http.post(url('/users/me/activity'), async ({ request }) => {
        const body = (await request.json()) as { seconds: number }
        receivedSeconds = body.seconds
        return HttpResponse.json({ minutes_today: 1, daily_goal_min: 15 })
      })
    )

    const onProgress = vi.fn()
    renderHook(() => useActivityHeartbeat({ onProgress, intervalSec: 2 }))

    // Advance 2 seconds — first tick fires
    await vi.advanceTimersByTimeAsync(2_000)

    await waitFor(() => expect(onProgress).toHaveBeenCalled())
    expect(receivedSeconds).toBeGreaterThanOrEqual(1)
    expect(onProgress).toHaveBeenCalledWith({ minutes_today: 1, daily_goal_min: 15 })
  })

  it('does not POST when nothing accumulated (sub-second tick)', async () => {
    const onProgress = vi.fn()
    let postCount = 0
    server.use(
      http.post(url('/users/me/activity'), () => {
        postCount++
        return HttpResponse.json({ minutes_today: 0, daily_goal_min: 15 })
      })
    )

    // Interval shorter than 1s — accumulated seconds always < 1
    renderHook(() => useActivityHeartbeat({ onProgress, intervalSec: 0.4 }))
    await vi.advanceTimersByTimeAsync(800)
    expect(postCount).toBe(0)
    expect(onProgress).not.toHaveBeenCalled()
  })

  it('flushes remaining time on unmount', async () => {
    let postedSeconds: number | null = null
    server.use(
      http.post(url('/users/me/activity'), async ({ request }) => {
        const body = (await request.json()) as { seconds: number }
        postedSeconds = body.seconds
        return HttpResponse.json({ minutes_today: 1, daily_goal_min: 15 })
      })
    )

    const { unmount } = renderHook(() => useActivityHeartbeat({ intervalSec: 60 }))

    // 3 seconds of visible time, then unmount before the interval fires
    await vi.advanceTimersByTimeAsync(3_000)
    unmount()
    await vi.advanceTimersByTimeAsync(50)

    await waitFor(() => expect(postedSeconds).not.toBeNull())
    expect(postedSeconds!).toBeGreaterThanOrEqual(2)
  })
})
