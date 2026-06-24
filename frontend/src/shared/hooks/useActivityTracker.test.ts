import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/api/user', () => ({
  postActivity: vi.fn().mockResolvedValue({ minutes_today: 2, daily_goal_min: 10 }),
}))

import { postActivity } from '@/api/user'
import { useActivityTracker } from './useActivityTracker'

describe('useActivityTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true })
  })

  it('posts activity every 30 seconds and returns updated progress', async () => {
    const mockPost = vi.mocked(postActivity)
    mockPost
      .mockResolvedValueOnce({ minutes_today: 2, daily_goal_min: 10 })
      .mockResolvedValueOnce({ minutes_today: 4, daily_goal_min: 10 })

    const { result } = renderHook(() => useActivityTracker())

    expect(mockPost).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(30_000))
    expect(mockPost).toHaveBeenCalledTimes(1)
    expect(result.current.minutesToday).toBe(2)

    await act(() => vi.advanceTimersByTimeAsync(30_000))
    expect(mockPost).toHaveBeenCalledTimes(2)
    expect(result.current.minutesToday).toBe(4)
  })

  it('pauses the interval when the document becomes hidden', async () => {
    const mockPost = vi.mocked(postActivity)

    renderHook(() => useActivityTracker())

    await act(async () => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await act(() => vi.advanceTimersByTimeAsync(90_000))

    expect(mockPost).not.toHaveBeenCalled()
  })

  it('resumes the interval when the document becomes visible again', async () => {
    const mockPost = vi.mocked(postActivity)

    renderHook(() => useActivityTracker())

    await act(async () => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await act(async () => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await act(() => vi.advanceTimersByTimeAsync(30_000))

    expect(mockPost).toHaveBeenCalledTimes(1)
  })

  it('cleans up interval on unmount — no calls after unmount', async () => {
    const mockPost = vi.mocked(postActivity)

    const { unmount } = renderHook(() => useActivityTracker())
    unmount()

    await act(() => vi.advanceTimersByTimeAsync(60_000))

    expect(mockPost).not.toHaveBeenCalled()
  })
})
