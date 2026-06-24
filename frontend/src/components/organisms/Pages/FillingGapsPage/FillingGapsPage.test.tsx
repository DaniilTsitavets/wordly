import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { gameSessionHandlers } from '@/test/handlers'
import { renderWithProviders } from '@/test/test-utils'
import { FillingGapsPage } from './FillingGapsPage'

const url = (path: string) => `${API_BASE_URL}${path}`

beforeEach(() => {
  server.use(...gameSessionHandlers)
})

const word = {
  id: 1,
  word_en: 'apple',
  transcription_en: '',
  translation_ru: 'яблоко',
  image_url: '',
  has_mnemonic: false,
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/subtopics/:subtopicId/filling-gaps" element={<FillingGapsPage />} />
    </Routes>,
    { route: '/subtopics/5/filling-gaps' }
  )
}

describe('FillingGapsPage', () => {
  it('renders error', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText(/Error: boom/)).toBeInTheDocument())
  })

  it('renders the Check / Reset buttons on initial state', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('shows "Correct!" banner for the right answer', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )

    const input = document.querySelector('input')!
    await userEvent.type(input, 'apple')
    await userEvent.click(screen.getByRole('button', { name: 'Check Answer' }))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })

  it('shows "Try Again" banner for the wrong answer', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )

    const input = document.querySelector('input')!
    await userEvent.type(input, 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Check Answer' }))

    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('Complete posts session and shows reward modal after correct answer (last word)', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })),
      http.post(url('/subtopics/5/session/complete'), () =>
        HttpResponse.json({
          mechanic_type: 'filling_gaps',
          gems_earned: 20,
          next_mechanic: null,
          subtopic_completed: true,
        })
      )
    )

    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )

    const input = document.querySelector('input')!
    await userEvent.type(input, 'apple')
    await userEvent.click(screen.getByRole('button', { name: 'Check Answer' }))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Complete' }))
    await waitFor(() => expect(screen.getByText('Level Complete!')).toBeInTheDocument())
    expect(screen.getByText('+20 Gems')).toBeInTheDocument()
  })

  it('Reset clears the input', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )

    const input = document.querySelector('input')!
    await userEvent.type(input, 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(input.value).toBe('')
  })
})
