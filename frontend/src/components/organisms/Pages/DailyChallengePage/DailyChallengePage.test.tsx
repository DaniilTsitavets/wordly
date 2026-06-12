import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { DailyChallengePage } from './DailyChallengePage'

const url = (path: string) => `${API_BASE_URL}${path}`

const game = {
  id: 42,
  idiom: 'piece of cake',
  options: ['easy', 'hard', 'sweet', 'small'],
}

describe('DailyChallengePage', () => {
  it('renders error if fetching the daily game fails', async () => {
    server.use(
      http.get(url('/daily-game'), () => HttpResponse.json({ message: 'bad' }, { status: 500 }))
    )
    renderWithProviders(<DailyChallengePage />)
    await waitFor(() => expect(screen.getByText('bad')).toBeInTheDocument())
  })

  it('renders the idiom + options once loaded', async () => {
    server.use(http.get(url('/daily-game'), () => HttpResponse.json(game)))
    renderWithProviders(<DailyChallengePage />)
    await waitFor(() => expect(screen.getByText(/piece of cake/)).toBeInTheDocument())
    expect(screen.getByText('easy')).toBeInTheDocument()
    expect(screen.getByText('hard')).toBeInTheDocument()
  })

  it('selects a correct answer and shows Correct! feedback', async () => {
    server.use(
      http.get(url('/daily-game'), () => HttpResponse.json(game)),
      http.post(url('/daily-game/answer'), () =>
        HttpResponse.json({ is_correct: true, correct_option: 1 })
      )
    )
    renderWithProviders(<DailyChallengePage />)
    await waitFor(() => expect(screen.getByText('easy')).toBeInTheDocument())
    await userEvent.click(screen.getByText('easy'))
    await waitFor(() => expect(screen.getByText(/Correct!/)).toBeInTheDocument())
  })

  it('selects a wrong answer and shows Not quite feedback', async () => {
    server.use(
      http.get(url('/daily-game'), () => HttpResponse.json(game)),
      http.post(url('/daily-game/answer'), () =>
        HttpResponse.json({ is_correct: false, correct_option: 1 })
      )
    )
    renderWithProviders(<DailyChallengePage />)
    await waitFor(() => expect(screen.getByText('hard')).toBeInTheDocument())
    await userEvent.click(screen.getByText('hard'))
    await waitFor(() => expect(screen.getByText(/Not quite!/)).toBeInTheDocument())
  })
})
