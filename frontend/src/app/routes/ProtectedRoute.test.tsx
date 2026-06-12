import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { ProtectedRoute } from './ProtectedRoute'

function Tree() {
  return (
    <Routes>
      <Route
        path="/private"
        element={
          <ProtectedRoute>
            <div>Private content</div>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<div>Home page</div>} />
    </Routes>
  )
}

describe('ProtectedRoute', () => {
  it('redirects to / when no token', () => {
    renderWithProviders(<Tree />, { route: '/private' })
    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByText('Private content')).not.toBeInTheDocument()
  })

  it('renders nothing while user is being loaded (token but no user)', () => {
    renderWithProviders(<Tree />, {
      route: '/private',
      preloadedState: { auth: { token: 'tok', user: null, isLoading: false, error: null } },
    })
    expect(screen.queryByText('Private content')).not.toBeInTheDocument()
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
  })

  it('redirects guest user to /', () => {
    renderWithProviders(<Tree />, {
      route: '/private',
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

  it('renders children for real authenticated user', () => {
    renderWithProviders(<Tree />, {
      route: '/private',
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: false },
          isLoading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('Private content')).toBeInTheDocument()
  })
})
