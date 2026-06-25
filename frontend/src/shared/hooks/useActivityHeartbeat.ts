import { useEffect, useRef } from 'react'
import { trackActivity } from '@/api/user'
import type { DailyProgress } from '@/api/user'

interface UseActivityHeartbeatOptions {
  /** Called with the updated progress after each successful heartbeat. */
  onProgress?: (progress: DailyProgress) => void
  /** Seconds between flushes. Server caps each request at 120s, so keep ≤120. */
  intervalSec?: number
}

const DEFAULT_INTERVAL_SEC = 60
// Backend caps each request at 120s (wall-clock anti-cheat).
const MAX_PER_REQUEST_SEC = 120

/**
 * Reports user study time to the daily-goal endpoint as a heartbeat
 * (BRD §9.1). Counts only time spent while the tab is visible — switching
 * away pauses the clock, returning resumes it. Flushes the remaining
 * accumulated time on unmount.
 *
 * Mount this on every screen that counts toward the goal (mechanic
 * sessions, recall practice, AI chat).
 */
export function useActivityHeartbeat(opts: UseActivityHeartbeatOptions = {}): void {
  const { onProgress, intervalSec = DEFAULT_INTERVAL_SEC } = opts
  // "Latest ref" pattern: read the current callback without restarting the
  // interval when it changes (assignment in a passive effect keeps lint happy).
  const onProgressRef = useRef(onProgress)
  useEffect(() => {
    onProgressRef.current = onProgress
  })

  useEffect(() => {
    let visibleSince: number | null = document.hidden ? null : Date.now()
    let pendingSeconds = 0
    let cancelled = false

    const accumulateVisibleTime = () => {
      if (visibleSince === null) return
      const now = Date.now()
      pendingSeconds += (now - visibleSince) / 1000
      visibleSince = now
    }

    const flush = async () => {
      accumulateVisibleTime()
      const seconds = Math.min(Math.floor(pendingSeconds), MAX_PER_REQUEST_SEC)
      if (seconds < 1) return
      pendingSeconds -= seconds
      try {
        const result = await trackActivity(seconds)
        if (!cancelled) onProgressRef.current?.(result)
      } catch {
        // restore credit so the next flush retries
        pendingSeconds += seconds
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        accumulateVisibleTime()
        visibleSince = null
      } else {
        visibleSince = Date.now()
      }
    }

    const intervalId = setInterval(() => {
      void flush()
    }, intervalSec * 1000)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Best-effort flush of any remaining time on unmount.
      accumulateVisibleTime()
      const seconds = Math.min(Math.floor(pendingSeconds), MAX_PER_REQUEST_SEC)
      if (seconds >= 1) {
        void trackActivity(seconds).catch(() => {})
      }
    }
  }, [intervalSec])
}
