import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './server'

// jsdom doesn't implement Element.scrollTo / scrollIntoView — components that
// auto-scroll (chat, lists) call them in useEffect and would throw otherwise.
if (!Element.prototype.scrollTo) Element.prototype.scrollTo = vi.fn()
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn()

// jsdom doesn't implement window.matchMedia — used by useTheme for system theme detection.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// MSW v2's experimental network mode occasionally fires an "unhandled
// rejection" with `Cannot bypass a request when using the "error" strategy`
// when a fetch is aborted during component cleanup (e.g. router redirects
// that unmount a page mid-request). The response was never going to ship,
// and the rejection isn't caused by a real bug in the test — it's noise from
// the test-runner cleanup race. Swallow only that specific message so we
// keep catching genuine unhandled errors.
process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && /Cannot bypass a request/.test(reason.message)) {
    return
  }
  throw reason
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())
