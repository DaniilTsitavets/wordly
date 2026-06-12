import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { RecallPage } from './RecallPage'

const url = (path: string) => `${API_BASE_URL}${path}`

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname + location.search}</div>
}

const word = {
  id: 1,
  word_en: 'apple',
  translation_ru: 'яблоко',
  recall_interval: 1 as const,
  next_recall: '2026-06-12',
}

describe('RecallPage', () => {
  it('renders error', async () => {
    server.use(
      http.get(url('/recall'), () => HttpResponse.json({ message: 'down' }, { status: 500 }))
    )
    renderWithProviders(<RecallPage />)
    await waitFor(() => expect(screen.getByText('down')).toBeInTheDocument())
  })

  it('renders summary card and disables Start All when total=0', async () => {
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 0, words: [] })))

    renderWithProviders(<RecallPage />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Active Recall Practice' })).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Start All Reviews' })).toBeDisabled()
  })

  it('enables Start All and renders the interval list with badges', async () => {
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 1, words: [word] })))

    renderWithProviders(<RecallPage />)
    await waitFor(() => expect(screen.getByText('1 word')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Start All Reviews' })).toBeEnabled()
    expect(screen.getByRole('heading', { name: 'Interval 1 Day' })).toBeInTheDocument()
  })

  it('navigates to /recall/practice when Start All is clicked', async () => {
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 1, words: [word] })))

    renderWithProviders(
      <Routes>
        <Route path="/recall" element={<RecallPage />} />
        <Route path="/recall/practice" element={<LocationProbe />} />
      </Routes>,
      { route: '/recall' }
    )

    await waitFor(() => expect(screen.getByText('1 word')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Start All Reviews' }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/recall/practice')
  })

  it('back button navigates to /', async () => {
    server.use(http.get(url('/recall'), () => HttpResponse.json({ total: 0, words: [] })))

    renderWithProviders(
      <Routes>
        <Route path="/recall" element={<RecallPage />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: '/recall' }
    )

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Active Recall Practice' })).toBeInTheDocument()
    )
    await userEvent.click(screen.getByLabelText('Back to Home'))
    expect(screen.getByTestId('loc').textContent?.startsWith('/')).toBe(true)
  })
})
