import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
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
  it('fires a kickoff on mount and streams the AI opener into the first assistant bubble', async () => {
    server.use(http.post(url('/ai/chat'), () => sseResponse(['Welcome', ' to', ' the market'])))

    const { result } = renderHook(() => useAiChat(1))

    // Mount immediately creates an empty assistant placeholder for the streamed opener
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.hasUserMessages).toBe(false)

    await waitFor(() => expect(result.current.isSending).toBe(false))
    expect(result.current.messages[0].content).toBe('Welcome to the market')
  })

  it('kickoff request carries an empty history (this is the conversation start)', async () => {
    let receivedHistory: unknown = null
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        const body = (await request.json()) as { history: unknown }
        receivedHistory = body.history
        return sseResponse(['hi'])
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isSending).toBe(false))

    expect(receivedHistory).toEqual([])
  })

  it('send() appends user msg + streams reply alongside the existing kickoff turn', async () => {
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), () => {
        callIndex++
        return sseResponse(callIndex === 1 ? ['scenario'] : ['Hello', ' there'])
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isSending).toBe(false))

    await act(async () => {
      await result.current.send('Hi there')
    })

    expect(result.current.messages).toHaveLength(3) // kickoff + user + assistant
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.messages[0].content).toBe('scenario')
    expect(result.current.messages[1]).toMatchObject({ role: 'user', content: 'Hi there' })
    expect(result.current.messages[2]).toMatchObject({ role: 'assistant', content: 'Hello there' })
    expect(result.current.hasUserMessages).toBe(true)
  })

  it('subsequent send() carries the kickoff scenario as part of the history', async () => {
    let lastHistory: unknown = null
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        callIndex++
        const body = (await request.json()) as { history: unknown }
        if (callIndex === 2) lastHistory = body.history
        return sseResponse(callIndex === 1 ? ['SCENARIO'] : ['ack'])
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isSending).toBe(false))

    await act(async () => {
      await result.current.send('user reply')
    })

    expect(lastHistory).toEqual([{ role: 'assistant', content: 'SCENARIO' }])
  })

  it('send() ignores empty / whitespace-only input', async () => {
    server.use(http.post(url('/ai/chat'), () => sseResponse(['s'])))

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isSending).toBe(false))

    await act(async () => {
      await result.current.send('   ')
    })
    expect(result.current.messages).toHaveLength(1) // only the kickoff
    expect(result.current.hasUserMessages).toBe(false)
  })

  it('send() sets error when backend returns non-2xx — user msg stays visible', async () => {
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), () => {
        callIndex++
        if (callIndex === 1) return sseResponse(['s'])
        return HttpResponse.json({ message: 'busy' }, { status: 503 })
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isSending).toBe(false))

    await act(async () => {
      await result.current.send('Hello')
    })

    expect(result.current.error).toBe('busy')
    expect(result.current.messages).toHaveLength(3) // kickoff + user + empty placeholder
    expect(result.current.messages[1].content).toBe('Hello')
    expect(result.current.messages[2].content).toBe('') // assistant placeholder never got tokens
  })

  it('surfaces the kickoff failure as an error when the backend rejects the mount call', async () => {
    server.use(
      http.post(url('/ai/chat'), () => HttpResponse.json({ message: 'down' }, { status: 500 }))
    )

    const { result } = renderHook(() => useAiChat(1))

    await waitFor(() => expect(result.current.error).toBe('down'))
    expect(result.current.isSending).toBe(false)
  })
})
