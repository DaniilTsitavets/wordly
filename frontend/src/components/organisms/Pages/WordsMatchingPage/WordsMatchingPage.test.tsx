import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { WordsMatchingPage } from './WordsMatchingPage'

const url = (path: string) => `${API_BASE_URL}${path}`

const word = (id: number, en: string, ru: string) => ({
  id,
  word_en: en,
  transcription_en: '',
  translation_ru: ru,
  image_url: '',
  has_mnemonic: false,
})

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/subtopics/:subtopicId/matching" element={<WordsMatchingPage />} />
    </Routes>,
    { route: '/subtopics/5/matching' }
  )
}

describe('WordsMatchingPage', () => {
  it('shows Loading initially', () => {
    server.use(http.get(url('/subtopics/5/words'), () => new Promise(() => {})))
    renderPage()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders error', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText(/Error: fail/)).toBeInTheDocument())
  })

  it('shows empty state', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [] })))
    renderPage()
    await waitFor(() => expect(screen.getByText('No words found')).toBeInTheDocument())
  })

  it('renders header + cards for first page', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [word(1, 'apple', 'яблоко'), word(2, 'pear', 'груша')] })
      )
    )
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Match the words/ })).toBeInTheDocument()
    )
  })

  it('shows 0 matched initially', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [word(1, 'apple', 'яблоко'), word(2, 'pear', 'груша')] })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText(/0\/2 matched/)).toBeInTheDocument())
  })

  it('selecting matching En + Ru cards increments matched', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [word(1, 'apple', 'яблоко'), word(2, 'pear', 'груша')] })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument())

    await userEvent.click(screen.getByText('apple'))
    await userEvent.click(screen.getByText('яблоко'))

    await waitFor(() => expect(screen.getByText(/1\/2 matched/)).toBeInTheDocument())
  })
})
