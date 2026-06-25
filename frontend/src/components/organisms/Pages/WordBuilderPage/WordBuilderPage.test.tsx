import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { gameSessionHandlers } from '@/test/handlers'
import { renderWithProviders } from '@/test/test-utils'
import { WordBuilderPage } from './WordBuilderPage'

const url = (path: string) => `${API_BASE_URL}${path}`

beforeEach(() => {
  server.use(...gameSessionHandlers)
})

const word = {
  id: 1,
  word_en: 'cat',
  transcription_en: '',
  translation_ru: 'кошка',
  image_url: '',
  has_mnemonic: false,
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/subtopics/:subtopicId/word-builder" element={<WordBuilderPage />} />
    </Routes>,
    { route: '/subtopics/5/word-builder' }
  )
}

describe('WordBuilderPage', () => {
  it('renders error', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText(/Error: fail/)).toBeInTheDocument())
  })

  it('shows empty state when no words', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [] })))
    renderPage()
    await waitFor(() => expect(screen.getByText('No words found')).toBeInTheDocument())
  })

  it('renders the Russian prompt and 3 letter tiles for "cat"', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()
    await waitFor(() => expect(screen.getByText('кошка')).toBeInTheDocument())
    expect(screen.getAllByRole('button', { name: /Letter [a-z]/ }).length).toBeGreaterThanOrEqual(3)
  })

  it('renders Reset + Check Answer buttons', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('clicking a letter then Check Answer shows Try Again (random shuffle)', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )

    // Pick a single letter — almost certainly not the full word "cat"
    const letters = screen.getAllByRole('button', { name: /Letter [a-z]/ })
    await userEvent.click(letters[0])
    await userEvent.click(screen.getByRole('button', { name: 'Check Answer' }))
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('Reset clears the answer plate back to placeholder', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Check Answer' })).toBeInTheDocument()
    )

    const letters = screen.getAllByRole('button', { name: /Letter [a-z]/ })
    await userEvent.click(letters[0])
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText(/Build the word/)).toBeInTheDocument()
  })
})
