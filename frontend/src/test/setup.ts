import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './server'

// jsdom doesn't implement Element.scrollTo / scrollIntoView — components that
// auto-scroll (chat, lists) call them in useEffect and would throw otherwise.
if (!Element.prototype.scrollTo) Element.prototype.scrollTo = vi.fn()
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())
