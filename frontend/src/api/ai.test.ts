import { describe, it, expect, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { streamChatMessage } from './ai'

const url = (path: string) => `${API_BASE_URL}${path}`

function sseStreamFor(tokens: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const t of tokens) {
        controller.enqueue(encoder.encode(`data: ${t}\n\n`))
      }
      controller.close()
    },
  })
}

function sseResponse(tokens: string[]): HttpResponse {
  return new HttpResponse(sseStreamFor(tokens), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('streamChatMessage', () => {
  it('accumulates tokens through onToken in order', async () => {
    server.use(http.post(url('/ai/chat'), () => sseResponse(['Hello', ' ', 'world'])))

    const tokens: string[] = []
    await streamChatMessage(
      { subtopicId: 1, history: [], message: 'hi' },
      { onToken: (t) => tokens.push(t) }
    )

    expect(tokens.join('')).toBe('Hello world')
  })

  it('POSTs the payload as JSON with Accept: text/event-stream', async () => {
    let receivedBody: unknown = null
    let receivedAccept: string | null = null

    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        receivedAccept = request.headers.get('accept')
        receivedBody = await request.json()
        return sseResponse(['ok'])
      })
    )

    await streamChatMessage(
      {
        subtopicId: 2,
        history: [{ role: 'assistant', content: 'prev' }],
        message: 'next',
      },
      { onToken: () => {} }
    )

    expect(receivedAccept).toContain('text/event-stream')
    expect(receivedBody).toEqual({
      subtopicId: 2,
      history: [{ role: 'assistant', content: 'prev' }],
      message: 'next',
    })
  })

  it('attaches Bearer token from localStorage', async () => {
    localStorage.setItem('access_token', 'tok-123')
    let receivedAuth: string | null = null
    server.use(
      http.post(url('/ai/chat'), ({ request }) => {
        receivedAuth = request.headers.get('authorization')
        return sseResponse(['x'])
      })
    )

    await streamChatMessage({ subtopicId: 1, history: [], message: 'x' }, { onToken: () => {} })
    expect(receivedAuth).toBe('Bearer tok-123')
  })

  it('throws with the message from the error body on non-2xx', async () => {
    server.use(
      http.post(url('/ai/chat'), () => HttpResponse.json({ message: 'busy' }, { status: 503 }))
    )

    await expect(
      streamChatMessage({ subtopicId: 1, history: [], message: 'x' }, { onToken: () => {} })
    ).rejects.toThrow('busy')
  })

  it('honors [DONE] marker and stops processing further events', async () => {
    server.use(http.post(url('/ai/chat'), () => sseResponse(['Hi', '[DONE]', 'AfterDone'])))

    const tokens: string[] = []
    await streamChatMessage(
      { subtopicId: 1, history: [], message: 'x' },
      { onToken: (t) => tokens.push(t) }
    )
    expect(tokens).toEqual(['Hi'])
  })

  it('handles SSE events with no leading space after "data:"', async () => {
    // Spring's SseEmitter for raw strings emits "data:<text>\n\n" without a space.
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data:foo\n\n'))
        controller.enqueue(encoder.encode('data:bar\n\n'))
        controller.close()
      },
    })
    server.use(
      http.post(
        url('/ai/chat'),
        () => new HttpResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      )
    )

    const tokens: string[] = []
    await streamChatMessage(
      { subtopicId: 1, history: [], message: 'x' },
      { onToken: (t) => tokens.push(t) }
    )
    expect(tokens).toEqual(['foo', 'bar'])
  })

  it('resolves silently when AbortSignal is triggered mid-stream', async () => {
    server.use(
      http.post(url('/ai/chat'), () => {
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(encoder.encode('data: Hi\n\n'))
            // Hold the stream open so the test can abort
            await new Promise(() => {})
          },
        })
        return new HttpResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      })
    )

    const controller = new AbortController()
    const onToken = vi.fn()
    const promise = streamChatMessage(
      { subtopicId: 1, history: [], message: 'x' },
      { onToken, signal: controller.signal }
    )

    // Give the stream a tick to deliver "Hi", then abort.
    await new Promise((r) => setTimeout(r, 10))
    controller.abort()
    await expect(promise).resolves.toBeUndefined()
    expect(onToken).toHaveBeenCalledWith('Hi')
  })
})
