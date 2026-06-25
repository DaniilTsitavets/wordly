import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { GameRoute } from './GameRoute'

function Tree() {
  return (
    <Routes>
      <Route
        path="/subtopics/:subtopicId/play"
        element={
          <GameRoute>
            <div>Game content</div>
          </GameRoute>
        }
      />
      <Route path="/" element={<div>Home page</div>} />
    </Routes>
  )
}

describe('GameRoute', () => {
  it('always allows the first subtopic (id=1) without auth', () => {
    renderWithProviders(<Tree />, { route: '/subtopics/1/play' })
    expect(screen.getByText('Game content')).toBeInTheDocument()
  })

  it('redirects to / when no token and id !== 1', () => {
    renderWithProviders(<Tree />, { route: '/subtopics/2/play' })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders nothing while user is loading (token, no user)', () => {
    renderWithProviders(<Tree />, {
      route: '/subtopics/2/play',
      preloadedState: { auth: { token: 'tok', user: null, isLoading: false, error: null } },
    })
    expect(screen.queryByText('Game content')).not.toBeInTheDocument()
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
  })

  it('redirects guest user to / when accessing non-first subtopic', () => {
    renderWithProviders(<Tree />, {
      route: '/subtopics/2/play',
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: true },
          isLoading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders the game for real authenticated user on any subtopic', () => {
    renderWithProviders(<Tree />, {
      route: '/subtopics/2/play',
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: false },
          isLoading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('Game content')).toBeInTheDocument()
  })
})
