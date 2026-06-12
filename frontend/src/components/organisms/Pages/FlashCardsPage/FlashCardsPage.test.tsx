import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { FlashCardsPage } from './FlashCardsPage'

const url = (path: string) => `${API_BASE_URL}${path}`

const word = (id: number, en: string) => ({
  id,
  word_en: en,
  transcription_en: '',
  translation_ru: 'rus' + id,
  image_url: 'http://img/a.png',
  has_mnemonic: false,
})

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/subtopics/:subtopicId/flashcards" element={<FlashCardsPage />} />
    </Routes>,
    { route: '/subtopics/5/flashcards' }
  )
}

describe('FlashCardsPage', () => {
  it('renders error', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ message: 'oops' }, { status: 500 })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText(/Error: oops/)).toBeInTheDocument())
  })

  it('renders "No words found" on empty', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [] })))
    renderPage()
    await waitFor(() => expect(screen.getByText('No words found')).toBeInTheDocument())
  })

  it('shows the first card, Previous disabled, Next enabled', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [word(1, 'apple'), word(2, 'pear')] })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('Card 1 of 2')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Previous/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled()
  })

  it('advances to Card 2 / 2 and shows Complete on last', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [word(1, 'apple'), word(2, 'pear')] })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('Card 1 of 2')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByText('Card 2 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument()
  })

  it('Previous goes back from Card 2 to Card 1', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [word(1, 'apple'), word(2, 'pear')] })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('Card 1 of 2')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByText('Card 2 of 2')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Previous/ }))
    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument()
  })

  it('Collect Reward sets sessionCompleted flag and navigates back', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word(1, 'apple')] })),
      http.post(url('/subtopics/5/session/complete'), () =>
        HttpResponse.json({
          mechanic_type: 'flashcards',
          gems_earned: 5,
          next_mechanic: null,
          subtopic_completed: true,
        })
      )
    )

    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Complete' }))
    await waitFor(() => expect(screen.getByText('Level Complete!')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /Collect reward/ }))
    expect(sessionStorage.getItem('sessionCompleted')).toBe('true')
    sessionStorage.removeItem('sessionCompleted')
  })

  it('Complete posts session and shows the reward modal', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word(1, 'apple')] })),
      http.post(url('/subtopics/5/session/complete'), () =>
        HttpResponse.json({
          mechanic_type: 'flashcards',
          gems_earned: 10,
          next_mechanic: null,
          subtopic_completed: true,
        })
      )
    )

    const { store } = renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Complete' }))
    await waitFor(() => expect(screen.getByText('Level Complete!')).toBeInTheDocument())
    expect(screen.getByText('+10 Gems')).toBeInTheDocument()
    expect(store.getState().auth.user).toBeNull() // no user preloaded, but no crash
  })
})
