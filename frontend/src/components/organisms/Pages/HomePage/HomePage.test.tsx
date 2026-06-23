import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { HomePage } from './HomePage'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic = {
  id: 1,
  name: 'Food',
  description: 'd',
  image_url: 'http://img/f.png',
  sort_order: 1,
  subtopics_total: 3,
  subtopics_completed: 0,
}

describe('HomePage', () => {
  it('shows a spinner while loading topics', () => {
    server.use(
      http.get(url('/topics'), () => new Promise(() => {})) // never resolves
    )
    const { container } = renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: false },
          isLoading: false,
          error: null,
        },
      },
    })
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders a friendly error message — never leaks the raw backend text', async () => {
    server.use(
      http.get(url('/topics'), () =>
        HttpResponse.json(
          { message: 'Full authentication is required to access this resource' },
          { status: 500 }
        )
      )
    )
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: false },
          isLoading: false,
          error: null,
        },
      },
    })
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Couldn't load topics/i)
    )
    expect(screen.queryByText(/Full authentication/)).not.toBeInTheDocument()
  })

  it('renders "Темы не найдены" on empty list', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [] })))
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
      },
    })
    await waitFor(() => expect(screen.getByText('Темы не найдены')).toBeInTheDocument())
  })

  it('renders DailyChallengeBanner when guest and shows topics', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [topic] })),
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([]))
    )

    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: true },
          isLoading: false,
          error: null,
        },
      },
    })

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Idiom Master Challenge' })).toBeInTheDocument()
    )
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('omits the banner for non-guest users', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [topic] })),
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([]))
    )

    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: false },
          isLoading: false,
          error: null,
        },
      },
    })

    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())
    expect(
      screen.queryByRole('heading', { name: 'Idiom Master Challenge' })
    ).not.toBeInTheDocument()
  })
})
