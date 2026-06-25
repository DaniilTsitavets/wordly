import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { AiChatPage } from './AiChatPage'

const url = (path: string) => `${API_BASE_URL}${path}`

// Page now requires a `?subtopicId=...` before rendering the chat — without
// one it shows the topic picker modal instead. Most tests want the chat, so
// we route there with a known id and stub the subtopic lookup the header pill
// fires on mount.
const CHAT_ROUTE = '/ai-chat?subtopicId=1'

beforeEach(() => {
  server.use(
    http.get(url('/subtopics/1'), () =>
      HttpResponse.json({
        id: 1,
        name: 'Fruits',
        description: '',
        image_url: '',
        words_count: 0,
        disabled_mechanics: [],
        levels: [],
      })
    )
  )
})

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

/**
 * Wires `POST /ai/chat` so the Nth call returns the Nth token list. The chat
 * fires a kickoff on mount, so call #1 is always the opener; tests that
 * exercise a user-typed reply pass that as call #2.
 */
function chatHandler(...calls: string[][]) {
  let i = 0
  return http.post(url('/ai/chat'), () => {
    const tokens = calls[Math.min(i++, calls.length - 1)]
    return sseResponse(tokens)
  })
}

describe('AiChatPage', () => {
  it('renders the title + composer once the kickoff stream resolves', async () => {
    server.use(chatHandler(['Welcome!']))
    renderWithProviders(<AiChatPage />, { route: CHAT_ROUTE })

    expect(screen.getByRole('heading', { name: 'AI Practice Chat' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Welcome!')).toBeInTheDocument())
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
  })

  it('disables Send button on empty input', async () => {
    server.use(chatHandler(['hi']))
    renderWithProviders(<AiChatPage />, { route: CHAT_ROUTE })
    await waitFor(() => expect(screen.getByText('hi')).toBeInTheDocument())
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('sends a typed message and streams the reply into the bubble', async () => {
    server.use(chatHandler(['kick'], ['Nice', ' ', 'one']))

    renderWithProviders(<AiChatPage />, { route: CHAT_ROUTE })
    await waitFor(() => expect(screen.getByText('kick')).toBeInTheDocument())

    const input = screen.getByLabelText('Message')
    await userEvent.type(input, 'test')
    await userEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByText('Nice one')).toBeInTheDocument())
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('shows a typing indicator until the first token arrives, then hides it', async () => {
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), () => {
        callIndex++
        if (callIndex === 1) return sseResponse(['kick'])
        // Delay the first token slightly so the typing indicator is observable.
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            await new Promise((r) => setTimeout(r, 50))
            controller.enqueue(encoder.encode('data: Hi\n\n'))
            controller.close()
          },
        })
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      })
    )

    renderWithProviders(<AiChatPage />, { route: CHAT_ROUTE })
    await waitFor(() => expect(screen.getByText('kick')).toBeInTheDocument())

    await userEvent.type(screen.getByLabelText('Message'), 'yo')
    await userEvent.click(screen.getByLabelText('Send message'))

    // Typing dots visible while we wait for the first token
    await waitFor(() => expect(screen.getByLabelText('AI is typing')).toBeInTheDocument())

    // Once the token arrives, the typing bubble disappears and the reply renders
    await waitFor(() => expect(screen.getByText('Hi')).toBeInTheDocument())
    expect(screen.queryByLabelText('AI is typing')).not.toBeInTheDocument()
  })

  it('shows error when the backend fails on a user send', async () => {
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), () => {
        callIndex++
        if (callIndex === 1) return sseResponse(['kick'])
        return HttpResponse.json({ message: 'rate-limited' }, { status: 429 })
      })
    )

    renderWithProviders(<AiChatPage />, { route: CHAT_ROUTE })
    await waitFor(() => expect(screen.getByText('kick')).toBeInTheDocument())

    await userEvent.type(screen.getByLabelText('Message'), 'hi')
    await userEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('rate-limited'))
  })

  it('shows the picker modal and empty state when no subtopicId is provided', async () => {
    server.use(
      http.get(url('/topics'), () =>
        HttpResponse.json({
          topics: [
            {
              id: 1,
              name: 'Food',
              description: 'Food vocabulary',
              image_url: '',
              sort_order: 1,
              subtopics_total: 1,
              subtopics_completed: 0,
            },
          ],
        })
      )
    )

    renderWithProviders(<AiChatPage />, { route: '/ai-chat' })

    // Empty state replaces the chat body — no kickoff fires because no subtopic
    expect(screen.getByRole('heading', { name: /Pick a topic/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: /Food/ })).toBeInTheDocument())
  })
})
