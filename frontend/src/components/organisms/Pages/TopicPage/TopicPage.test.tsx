import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { TopicPage } from './TopicPage'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic = {
  id: 1,
  name: 'Food',
  description: 'About food',
  image_url: 'http://img/f.png',
  sort_order: 1,
  subtopics_total: 0,
  subtopics_completed: 0,
}

describe('TopicPage', () => {
  it('renders empty state', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [] })))
    renderWithProviders(<TopicPage />, {
      preloadedState: {
        auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
      },
    })
    await waitFor(() => expect(screen.getByText('Темы не найдены')).toBeInTheDocument())
  })

  it('renders error', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ message: 'bad' }, { status: 500 }))
    )
    renderWithProviders(<TopicPage />, {
      preloadedState: {
        auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
      },
    })
    await waitFor(() => expect(screen.getByText(/Error: bad/)).toBeInTheDocument())
  })

  it('renders topics and DailyChallengeBanner for guest', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [topic] })),
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([]))
    )

    renderWithProviders(<TopicPage />, {
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: true },
          isLoading: false,
          error: null,
        },
      },
    })

    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Idiom Master Challenge' })).toBeInTheDocument()
  })
})
