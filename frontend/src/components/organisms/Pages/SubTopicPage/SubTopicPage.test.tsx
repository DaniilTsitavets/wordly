import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { SubTopicPage } from './SubTopicPage'

const url = (path: string) => `${API_BASE_URL}${path}`

const detail = {
  id: 10,
  name: 'Drinks',
  description: 'Beverages',
  image_url: 'http://img/d.png',
  words_count: 5,
  disabled_mechanics: [],
  levels: [
    {
      mechanic_type: 'mnemonic_cards' as const,
      status: 'unblocked' as const,
      started_at: null,
      completed_at: null,
    },
    {
      mechanic_type: 'flashcards' as const,
      status: 'locked' as const,
      started_at: null,
      completed_at: null,
    },
    {
      mechanic_type: 'matching' as const,
      status: 'completed' as const,
      started_at: '2026-06-01',
      completed_at: '2026-06-02',
    },
  ],
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/subtopics/:subtopicId" element={<SubTopicPage />} />
    </Routes>,
    {
      route: '/subtopics/10',
      preloadedState: {
        auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
      },
    }
  )
}

describe('SubTopicPage', () => {
  it('renders subtopic name, description and levels', async () => {
    server.use(http.get(url('/subtopics/10'), () => HttpResponse.json(detail)))

    renderPage()

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Drinks' })).toBeInTheDocument())
    expect(screen.getByText('Beverages')).toBeInTheDocument()
    expect(screen.getByText(/Level 0:\s*Mnemonics/)).toBeInTheDocument()
    expect(screen.getByText(/Level 1:\s*Flashcards/)).toBeInTheDocument()
    expect(screen.getByText(/Level 2:\s*Matching pairs/)).toBeInTheDocument()
  })

  it('shows the current-level CTA matching the first unblocked level', async () => {
    server.use(http.get(url('/subtopics/10'), () => HttpResponse.json(detail)))
    renderPage()
    await waitFor(() => expect(screen.getByText(/5 New Words/)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Start Learning/ })).toBeInTheDocument()
  })

  it('renders error', async () => {
    server.use(
      http.get(url('/subtopics/10'), () =>
        HttpResponse.json({ message: 'no subtopic' }, { status: 404 })
      )
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('no subtopic')).toBeInTheDocument())
  })

  it('renders Completed badge for completed levels and Locked label for locked', async () => {
    server.use(http.get(url('/subtopics/10'), () => HttpResponse.json(detail)))
    renderPage()
    await waitFor(() => expect(screen.getByText('Completed')).toBeInTheDocument())
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('navigates to the mnemonic-cards route from the current-level CTA', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    server.use(http.get(url('/subtopics/10'), () => HttpResponse.json(detail)))
    renderWithProviders(
      <Routes>
        <Route path="/subtopics/:subtopicId" element={<SubTopicPage />} />
        <Route path="/subtopics/:subtopicId/mnemonic-cards" element={<div>Mnemonic page</div>} />
      </Routes>,
      {
        route: '/subtopics/10',
        preloadedState: {
          auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
        },
      }
    )

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Start Learning/ })).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: /Start Learning/ }))
    await waitFor(() => expect(screen.getByText('Mnemonic page')).toBeInTheDocument())
  })

  it.each([
    ['flashcards', '/subtopics/10/flashcards', 'Flashcards page'] as const,
    ['matching', '/subtopics/10/matching', 'Matching page'] as const,
    ['word_builder', '/subtopics/10/word-builder', 'Word builder page'] as const,
    ['filling_gaps', '/subtopics/10/filling-gaps', 'Filling gaps page'] as const,
  ])('Start button on Level row routes to %s', async (mechType, path, body) => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const onlyOne = {
      ...detail,
      levels: [
        {
          mechanic_type: mechType as never,
          status: 'unblocked' as const,
          started_at: null,
          completed_at: null,
        },
      ],
    }
    server.use(http.get(url('/subtopics/10'), () => HttpResponse.json(onlyOne)))

    renderWithProviders(
      <Routes>
        <Route path="/subtopics/:subtopicId" element={<SubTopicPage />} />
        <Route path={path} element={<div>{body}</div>} />
      </Routes>,
      {
        route: '/subtopics/10',
        preloadedState: {
          auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
        },
      }
    )

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /Start/ }).length).toBeGreaterThan(0)
    )
    // Click the small Start button in the learning path row, not the big CTA
    const startButtons = screen.getAllByRole('button', { name: 'Start' })
    await userEvent.click(startButtons[0])
    await waitFor(() => expect(screen.getByText(body)).toBeInTheDocument())
  })

  it('claims daily goal and shows reward modal when sessionCompleted flag is set', async () => {
    sessionStorage.setItem('sessionCompleted', 'true')
    server.use(
      http.get(url('/subtopics/10'), () => HttpResponse.json(detail)),
      http.post(url('/users/me/daily-goal/claim'), () =>
        HttpResponse.json({ reached: true, gems_awarded: 50 })
      )
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('Level Complete!')).toBeInTheDocument())
    expect(screen.getByText('+50 Gems')).toBeInTheDocument()
  })
})
