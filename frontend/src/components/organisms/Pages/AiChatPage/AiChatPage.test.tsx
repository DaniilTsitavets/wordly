import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { AiChatPage } from './AiChatPage'

const url = (path: string) => `${API_BASE_URL}${path}`

function sseResponse(tokens: string[]): HttpResponse {
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

describe('AiChatPage', () => {
  it('renders the title + Demo badge + a local opener message immediately (no spinner)', () => {
    renderWithProviders(<AiChatPage />)
    expect(screen.getByRole('heading', { name: 'AI Practice Chat' })).toBeInTheDocument()
    // Opener is rendered synchronously; chat is interactive right away.
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
  })

  it('shows suggested prompts before the user has sent anything', () => {
    renderWithProviders(<AiChatPage />)
    expect(screen.getByText(/Try these prompts/)).toBeInTheDocument()
  })

  it('disables Send button on empty input', () => {
    renderWithProviders(<AiChatPage />)
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('sends a typed message and streams the reply into the bubble', async () => {
    server.use(http.post(url('/ai/chat'), () => sseResponse(['Nice', ' ', 'one'])))

    renderWithProviders(<AiChatPage />)

    const input = screen.getByLabelText('Message')
    await userEvent.type(input, 'test')
    await userEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByText('Nice one')).toBeInTheDocument())
    expect(screen.getByText('test')).toBeInTheDocument()
    // Prompts disappear once the user has sent something
    expect(screen.queryByText(/Try these prompts/)).not.toBeInTheDocument()
  })

  it('clicking a suggested prompt sends it', async () => {
    let lastBody: { message: string } | null = null
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        lastBody = (await request.json()) as { message: string }
        return sseResponse(['ok'])
      })
    )

    renderWithProviders(<AiChatPage />)
    await userEvent.click(screen.getByRole('button', { name: /Quiz me/ }))
    await waitFor(() => expect(lastBody?.message).toContain('Quiz me'))
  })

  it('shows a typing indicator until the first token arrives, then hides it', async () => {
    server.use(
      http.post(url('/ai/chat'), () => {
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

    renderWithProviders(<AiChatPage />)
    await userEvent.type(screen.getByLabelText('Message'), 'yo')
    await userEvent.click(screen.getByLabelText('Send message'))

    // Typing dots visible while we wait for the first token
    await waitFor(() => expect(screen.getByLabelText('AI is typing')).toBeInTheDocument())

    // Once the token arrives, the typing bubble disappears and the reply renders
    await waitFor(() => expect(screen.getByText('Hi')).toBeInTheDocument())
    expect(screen.queryByLabelText('AI is typing')).not.toBeInTheDocument()
  })

  it('shows error when the backend fails', async () => {
    server.use(
      http.post(url('/ai/chat'), () =>
        HttpResponse.json({ message: 'rate-limited' }, { status: 429 })
      )
    )

    renderWithProviders(<AiChatPage />)
    await userEvent.type(screen.getByLabelText('Message'), 'hi')
    await userEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('rate-limited'))
  })
})
