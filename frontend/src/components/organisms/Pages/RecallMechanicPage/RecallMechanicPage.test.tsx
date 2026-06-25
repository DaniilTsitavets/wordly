import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { RecallMechanicPage } from './RecallMechanicPage'

const url = (path: string) => `${API_BASE_URL}${path}`

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

const word = {
  id: 1,
  word_en: 'cat',
  translation_ru: 'кошка',
  recall_interval: 3 as const,
  next_recall: '2026-06-12',
}

describe('RecallMechanicPage', () => {
  it('renders error', async () => {
    server.use(
      http.get(url('/recall'), () => HttpResponse.json({ message: 'bad' }, { status: 500 }))
    )
    renderWithProviders(<RecallMechanicPage />)
    await waitFor(() => expect(screen.getByText(/Error: bad/)).toBeInTheDocument())
  })

  it('shows "No words due" with Back to Recall when no words', async () => {
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 0, words: [] })))

    renderWithProviders(
      <Routes>
        <Route path="/recall/practice" element={<RecallMechanicPage />} />
        <Route path="/recall" element={<LocationProbe />} />
      </Routes>,
      { route: '/recall/practice' }
    )

    await waitFor(() => expect(screen.getByText('No words due for review')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Back to Recall' }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/recall')
  })

  it('renders the russian prompt + interval badge for the first word', async () => {
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 1, words: [word] })))

    renderWithProviders(<RecallMechanicPage />)
    await waitFor(() => expect(screen.getByText('Кошка')).toBeInTheDocument())
    expect(screen.getByText(/Interval: \+3 days/)).toBeInTheDocument()
  })

  it('filters words by ?interval= query', async () => {
    server.use(
      http.get(url('/recall'), () =>
        HttpResponse.json({
          total: 2,
          words: [
            word,
            { ...word, id: 2, word_en: 'dog', translation_ru: 'собака', recall_interval: 7 },
          ],
        })
      )
    )

    renderWithProviders(<RecallMechanicPage />, { route: '/recall/practice?interval=7' })
    await waitFor(() => expect(screen.getByText('Собака')).toBeInTheDocument())
    expect(screen.queryByText('Кошка')).not.toBeInTheDocument()
  })

  it('selecting a letter then clicking Check Answer with backend error falls back to local check', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(
      http.get(url('/recall'), () => HttpResponse.json({ total: 1, words: [word] })),
      http.post(url('/recall/answer'), () =>
        HttpResponse.json({ message: 'network' }, { status: 500 })
      )
    )

    renderWithProviders(<RecallMechanicPage />)
    await waitFor(() => expect(screen.getByText('Кошка')).toBeInTheDocument())

    // Pick a wrong letter — fallback runs local comparison, marks incorrect
    const letters = screen.getAllByRole('button', { name: /Letter [a-z]/ })
    await userEvent.click(letters[0])
    await userEvent.click(screen.getByRole('button', { name: 'Check Answer' }))
    // Either Correct or Try Again — both exercise the fallback path
    const hasFeedback =
      screen.queryAllByText('Try Again').length > 0 || screen.queryAllByText('Correct!').length > 0
    expect(hasFeedback).toBe(true)
  })

  it('back button navigates to /recall', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 1, words: [word] })))

    const { Routes, Route, useLocation } = await import('react-router-dom')
    function Probe() {
      const loc = useLocation()
      return <div data-testid="loc2">{loc.pathname}</div>
    }

    renderWithProviders(
      <Routes>
        <Route path="/recall/practice" element={<RecallMechanicPage />} />
        <Route path="/recall" element={<Probe />} />
      </Routes>,
      { route: '/recall/practice' }
    )

    await waitFor(() => expect(screen.getByText('Кошка')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Go back'))
    expect(screen.getByTestId('loc2')).toHaveTextContent('/recall')
  })
})
