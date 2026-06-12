import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { useAiChat } from './useAiChat'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('useAiChat', () => {
  it('bootstraps with a greeting message on mount', async () => {
    server.use(http.post(url('/ai/chat'), () => HttpResponse.json({ reply: 'Welcome to chat!' })))

    const { result } = renderHook(() => useAiChat(1))

    expect(result.current.isBootstrapping).toBe(true)
    expect(result.current.messages).toEqual([])

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.messages[0].content).toBe('Welcome to chat!')
    expect(result.current.hasUserMessages).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets error when bootstrap fails', async () => {
    server.use(
      http.post(url('/ai/chat'), () => HttpResponse.json({ message: 'boom' }, { status: 500 }))
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    expect(result.current.error).toBe('boom')
    expect(result.current.messages).toEqual([])
  })

  it('send() appends a user message and an assistant reply', async () => {
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), () => {
        callIndex++
        return HttpResponse.json({ reply: callIndex === 1 ? 'hi' : 'You said hi back' })
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.send('Hello')
    })

    expect(result.current.messages).toHaveLength(3)
    expect(result.current.messages[1].role).toBe('user')
    expect(result.current.messages[1].content).toBe('Hello')
    expect(result.current.messages[2].role).toBe('assistant')
    expect(result.current.messages[2].content).toBe('You said hi back')
    expect(result.current.hasUserMessages).toBe(true)
  })

  it('send() forwards the existing history to the backend', async () => {
    let receivedHistory: unknown = null
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        callIndex++
        if (callIndex >= 2) {
          const body = (await request.json()) as { history: unknown }
          receivedHistory = body.history
        }
        return HttpResponse.json({ reply: 'r' })
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.send('first')
    })

    expect(receivedHistory).toEqual([{ role: 'assistant', content: 'r' }])
  })

  it('send() ignores empty or whitespace-only input', async () => {
    server.use(http.post(url('/ai/chat'), () => HttpResponse.json({ reply: 'hi' })))

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.send('   ')
    })

    expect(result.current.messages).toHaveLength(1) // only the greeting
  })

  it('send() sets error and keeps user message when reply fails', async () => {
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), () => {
        callIndex++
        if (callIndex === 1) return HttpResponse.json({ reply: 'hi' })
        return HttpResponse.json({ message: 'busy' }, { status: 503 })
      })
    )

    const { result } = renderHook(() => useAiChat(1))
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.send('Hello')
    })

    expect(result.current.error).toBe('busy')
    expect(result.current.messages).toHaveLength(2) // greeting + user, no assistant reply
    expect(result.current.messages[1].role).toBe('user')
  })
})
