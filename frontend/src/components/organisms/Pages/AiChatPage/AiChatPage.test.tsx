import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { AiChatPage } from './AiChatPage'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('AiChatPage', () => {
  it('renders the title and Demo badge (mock backend)', async () => {
    server.use(http.post(url('/ai/chat'), () => HttpResponse.json({ reply: 'hi!' })))

    renderWithProviders(<AiChatPage />)
    expect(screen.getByRole('heading', { name: 'AI Practice Chat' })).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('hi!')).toBeInTheDocument())
  })

  it('shows suggested prompts before any user input', async () => {
    server.use(http.post(url('/ai/chat'), () => HttpResponse.json({ reply: 'hi!' })))

    renderWithProviders(<AiChatPage />)
    await waitFor(() => expect(screen.getByText(/Try these prompts/)).toBeInTheDocument())
    expect(screen.getAllByRole('button')).toEqual(expect.any(Array))
  })

  it('disables Send button on empty input', async () => {
    server.use(http.post(url('/ai/chat'), () => HttpResponse.json({ reply: 'hi!' })))

    renderWithProviders(<AiChatPage />)
    await waitFor(() => expect(screen.getByText('hi!')).toBeInTheDocument())
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('sends the typed message and shows the reply', async () => {
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), () => {
        callIndex++
        return HttpResponse.json({
          reply: callIndex === 1 ? 'hello' : 'thanks for: test',
        })
      })
    )

    renderWithProviders(<AiChatPage />)
    await waitFor(() => expect(screen.getByText('hello')).toBeInTheDocument())

    const input = screen.getByLabelText('Message')
    await userEvent.type(input, 'test')
    await userEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByText('thanks for: test')).toBeInTheDocument())
  })

  it('clicking a suggested prompt sends it', async () => {
    let lastBody: { message: string } | null = null
    let callIndex = 0
    server.use(
      http.post(url('/ai/chat'), async ({ request }) => {
        callIndex++
        const body = (await request.json()) as { message: string }
        if (callIndex > 1) lastBody = body
        return HttpResponse.json({ reply: 'ok' })
      })
    )

    renderWithProviders(<AiChatPage />)
    await waitFor(() => expect(screen.getByText(/Try these prompts/)).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /Quiz me/ }))
    await waitFor(() => expect(lastBody?.message).toContain('Quiz me'))
  })

  it('shows error message on bootstrap failure', async () => {
    server.use(
      http.post(url('/ai/chat'), () => HttpResponse.json({ message: 'busy' }, { status: 503 }))
    )

    renderWithProviders(<AiChatPage />)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('busy'))
  })
})
