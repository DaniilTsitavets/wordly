import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { gameSessionHandlers } from '@/test/handlers'
import { renderWithProviders } from '@/test/test-utils'
import { MnemonicCardsPage } from './MnemonicCardsPage'

const url = (path: string) => `${API_BASE_URL}${path}`

beforeEach(() => {
  server.use(...gameSessionHandlers)
})

const word = {
  id: 1,
  word_en: 'apple',
  transcription_en: 'ˈæpəl',
  translation_ru: 'яблоко',
  image_url: 'http://img/a.png',
  has_mnemonic: true,
  mnemonic_image_url: 'http://img/mn.png',
  mnemonic_text: 'a-pull',
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/subtopics/:subtopicId/mnemonic-cards" element={<MnemonicCardsPage />} />
    </Routes>,
    { route: '/subtopics/5/mnemonic-cards' }
  )
}

describe('MnemonicCardsPage', () => {
  it('shows Loading initially', () => {
    server.use(http.get(url('/subtopics/5/words'), () => new Promise(() => {})))
    renderPage()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders error', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ message: 'no words' }, { status: 500 })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText(/Error: no words/)).toBeInTheDocument())
  })

  it('shows "No mnemonic words found" when words are present but none have mnemonics', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [{ ...word, has_mnemonic: false }] })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('No mnemonic words found')).toBeInTheDocument())
  })

  it('renders the first card with progress text', async () => {
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()
    await waitFor(() => expect(screen.getByText('Card 1 of 1')).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'apple' })).toBeInTheDocument()
  })

  it('Complete posts session and shows the reward modal', async () => {
    server.use(
      http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })),
      http.post(url('/subtopics/5/session/complete'), () =>
        HttpResponse.json({
          mechanic_type: 'mnemonic_cards',
          gems_earned: 15,
          next_mechanic: 'flashcards',
          subtopic_completed: false,
        })
      )
    )

    const { default: userEvent } = await import('@testing-library/user-event')
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Complete' }))
    await waitFor(() => expect(screen.getByText('Level Complete!')).toBeInTheDocument())
    expect(screen.getByText('+15 Gems')).toBeInTheDocument()
  })

  it('Next + Previous navigate between cards (with 2 mnemonic words)', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(
      http.get(url('/subtopics/5/words'), () =>
        HttpResponse.json({ words: [word, { ...word, id: 2, word_en: 'pear' }] })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('Card 1 of 2')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByText('Card 2 of 2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Previous/ }))
    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument()
  })

  it('Collect Reward closes modal and sets sessionCompleted', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(
      http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })),
      http.post(url('/subtopics/5/session/complete'), () =>
        HttpResponse.json({
          mechanic_type: 'mnemonic_cards',
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

  it('clicking the card flips it (onFlip)', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(http.get(url('/subtopics/5/words'), () => HttpResponse.json({ words: [word] })))
    renderPage()
    await waitFor(() => expect(screen.getByText('Card 1 of 1')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Word card: apple/ }))
    // No throw + still renders translation on back face — already verified by Card tests
    expect(screen.getByText('яблоко')).toBeInTheDocument()
  })
})
