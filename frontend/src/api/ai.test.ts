import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { sendChatMessage } from './ai'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('ai API', () => {
  it('POSTs the full payload (subtopicId + history + message) to /ai/chat', async () => {
    let receivedBody: unknown = null
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ reply: 'hi there' })
      })
    )

    const payload = {
      subtopicId: 1,
      history: [
        { role: 'assistant' as const, content: 'Hello' },
        { role: 'user' as const, content: 'Hi' },
      ],
      message: 'How are you?',
    }
    const result = await sendChatMessage(payload)
    expect(receivedBody).toEqual(payload)
    expect(result.reply).toBe('hi there')
  })

  it('supports an empty history (bootstrap call)', async () => {
    let receivedHistory: unknown = null
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        const body = (await request.json()) as { history: unknown }
        receivedHistory = body.history
        return HttpResponse.json({ reply: 'welcome' })
      })
    )

    await sendChatMessage({ subtopicId: 2, history: [], message: 'seed' })
    expect(receivedHistory).toEqual([])
  })

  it('propagates server errors', async () => {
    server.use(
      http.post(url('/ai/chat'), () =>
        HttpResponse.json({ message: 'rate-limited' }, { status: 429 })
      )
    )
    await expect(sendChatMessage({ subtopicId: 1, history: [], message: 'x' })).rejects.toThrow(
      'rate-limited'
    )
  })
})
