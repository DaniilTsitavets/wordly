import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useAiChat } from './useAiChat'

const url = (path: string) => `${API_BASE_URL}${path}`

function sseResponse(tokens: string[]) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      for (const t of tokens) {
        controller.enqueue(encoder.encode(`data: ${t}\n\n`))
      }
      controller.close()
    },
  })
  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('useAiChat', () => {
  it('starts with a local opener message — no AI bootstrap call', () => {
    const { result } = renderHook(() => useAiChat(1))

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.messages[0].content.length).toBeGreaterThan(0)
    expect(result.current.hasUserMessages).toBe(false)
    expect(result.current.isSending).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('send() appends user msg + streams tokens into a new assistant msg', async () => {
    server.use(http.post(url('/ai/chat'), () => sseResponse(['Hello', ' ', 'there'])))

    const { result } = renderHook(() => useAiChat(1))

    await act(async () => {
      await result.current.send('Hi there')
    })

    expect(result.current.messages).toHaveLength(3) // opener + user + assistant
    expect(result.current.messages[1].role).toBe('user')
    expect(result.current.messages[1].content).toBe('Hi there')
    expect(result.current.messages[2].role).toBe('assistant')
    expect(result.current.messages[2].content).toBe('Hello there')
    expect(result.current.hasUserMessages).toBe(true)
    expect(result.current.isSending).toBe(false)
  })

  it('send() does NOT include the local opener in the history sent to backend', async () => {
    let receivedHistory: unknown = null
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        const body = (await request.json()) as { history: unknown }
        receivedHistory = body.history
        return sseResponse(['ok'])
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await act(async () => {
      await result.current.send('first user message')
    })

    // The opener should be filtered out → empty history on the wire
    expect(receivedHistory).toEqual([])
  })

  it('subsequent send() carries the prior real exchange (not the opener)', async () => {
    let secondHistory: unknown = null
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        callIndex++
        if (callIndex === 2) {
          const body = (await request.json()) as { history: unknown }
          secondHistory = body.history
        }
        return sseResponse(['r'])
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await act(async () => {
      await result.current.send('first')
    })
    await act(async () => {
      await result.current.send('second')
    })

    expect(secondHistory).toEqual([
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'r' },
    ])
  })

  it('send() ignores empty / whitespace-only input', async () => {
    const { result } = renderHook(() => useAiChat(1))
    await act(async () => {
      await result.current.send('   ')
    })
    expect(result.current.messages).toHaveLength(1) // only opener
    expect(result.current.hasUserMessages).toBe(false)
  })

  it('send() sets error when backend returns non-2xx — user msg stays visible', async () => {
    server.use(
      http.post(url('/ai/chat'), () => HttpResponse.json({ message: 'busy' }, { status: 503 }))
    )

    const { result } = renderHook(() => useAiChat(1))
    await act(async () => {
      await result.current.send('Hello')
    })

    expect(result.current.error).toBe('busy')
    expect(result.current.messages).toHaveLength(3) // opener + user + empty assistant placeholder
    expect(result.current.messages[1].content).toBe('Hello')
    expect(result.current.messages[2].content).toBe('') // assistant placeholder never got tokens
  })
})
