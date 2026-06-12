import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { AdminRoute } from './AdminRoute'

const url = (path: string) => `${API_BASE_URL}${path}`

function Tree() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <div>Admin content</div>
          </AdminRoute>
        }
      />
      <Route path="/" element={<div>Home page</div>} />
    </Routes>
  )
}

describe('AdminRoute', () => {
  it('redirects to / when no token', () => {
    renderWithProviders(<Tree />, { route: '/admin' })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('redirects guest user to /', () => {
    renderWithProviders(<Tree />, {
      route: '/admin',
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: true, role: 'USER' },
          isLoading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('redirects regular USER to /', () => {
    renderWithProviders(<Tree />, {
      route: '/admin',
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, role: 'USER' },
          isLoading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders Admin content for ADMIN role', () => {
    renderWithProviders(<Tree />, {
      route: '/admin',
      preloadedState: {
        auth: {
          token: 'tok',
          user: { ...mockUser, is_guest: false, role: 'ADMIN' },
          isLoading: false,
          error: null,
        },
      },
    })
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('fetches /users/me when token exists but no user', async () => {
    server.use(http.get(url('/users/me'), () => HttpResponse.json({ ...mockUser, role: 'ADMIN' })))

    const { store } = renderWithProviders(<Tree />, {
      route: '/admin',
      preloadedState: { auth: { token: 'tok', user: null, isLoading: false, error: null } },
    })

    await waitFor(() => expect(store.getState().auth.user?.role).toBe('ADMIN'))
  })

  it('logs out on /users/me failure', async () => {
    server.use(
      http.get(url('/users/me'), () => HttpResponse.json({ message: 'bad' }, { status: 401 }))
    )

    const { store } = renderWithProviders(<Tree />, {
      route: '/admin',
      preloadedState: { auth: { token: 'tok', user: null, isLoading: false, error: null } },
    })

    await waitFor(() => expect(store.getState().auth.token).toBeNull())
  })
})
