import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { Layout } from './LayoutPage'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the spinner while bootstrapping (no token)', async () => {
    server.use(
      http.post(url('/auth/guest'), async () => {
        // never resolve — stays in bootstrapping
        return new Promise(() => {})
      })
    )

    const { container } = renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Outlet content</div>} />
        </Route>
      </Routes>
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.queryByText('Outlet content')).not.toBeInTheDocument()
  })

  it('shows bootstrap error when guest login fails, with Try again button', async () => {
    server.use(
      http.post(url('/auth/guest'), () =>
        HttpResponse.json({ message: 'no guests today' }, { status: 500 })
      )
    )

    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Outlet</div>} />
        </Route>
      </Routes>
    )

    await waitFor(() =>
      expect(screen.getByText(/Couldn't start the session: no guests today/)).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('renders the Outlet content once a token exists in store', async () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Outlet</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, is_guest: false },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    expect(screen.getByText('Outlet')).toBeInTheDocument()
  })

  it('renders the authenticated Header when token + non-guest user', async () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>X</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, is_guest: false, gems: 7, streak: 3 },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    expect(screen.getByLabelText('Daily streak: 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Total points: 7')).toBeInTheDocument()
  })

  it('renders the guest header (Login button) when user is_guest', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>X</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, is_guest: true },
            isLoading: false,
            error: null,
          },
        },
      }
    )
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('hides the header on the onboarding route', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/onboarding/daily-goal" element={<div>Onboarding</div>} />
        </Route>
      </Routes>,
      {
        route: '/onboarding/daily-goal',
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, onboarding_completed: false },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('fetches /users/me when token exists but no user is loaded yet', async () => {
    server.use(http.get(url('/users/me'), () => HttpResponse.json(mockUser)))

    const { store } = renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Outlet</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: { token: 'tok', user: null, isLoading: false, error: null },
        },
      }
    )

    // Wait for setUser to populate
    await waitFor(() => expect(store.getState().auth.user).toEqual(mockUser))
  })

  it('redirects from onboarding to / when user has onboarding_completed', async () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/onboarding/daily-goal" element={<div>Onboarding body</div>} />
          <Route path="/" element={<div>Home body</div>} />
        </Route>
      </Routes>,
      {
        route: '/onboarding/daily-goal',
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, is_guest: false, onboarding_completed: true },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    await waitFor(() => expect(screen.getByText('Home body')).toBeInTheDocument())
  })

  it('fires nav handlers when Header buttons are clicked (vocab/recall/ai-chat/profile/admin)', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')

    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/vocabulary" element={<div>Vocab body</div>} />
          <Route path="/recall" element={<div>Recall body</div>} />
          <Route path="/ai-chat" element={<div>AI body</div>} />
          <Route path="/profile" element={<div>Profile body</div>} />
          <Route path="/admin/dashboard" element={<div>Admin body</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, is_guest: false, role: 'ADMIN' },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    await userEvent.click(screen.getByLabelText('Vocabulary'))
    expect(screen.getByText('Vocab body')).toBeInTheDocument()
  })

  it('logs out — clears the authenticated user', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    // Stub /auth/guest so the post-logout bootstrap doesn't re-populate the
    // store before our assertion runs.
    server.use(http.post(url('/auth/guest'), () => new Promise(() => {})))

    const { store } = renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Home</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, is_guest: false, role: 'USER' },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    await userEvent.click(screen.getByLabelText('Перейти в профиль'))
    await userEvent.click(screen.getByRole('menuitem', { name: /Log out/ }))
    expect(store.getState().auth.user).toBeNull()
  })

  it('opens AuthModal when guest clicks the Login button', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')

    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Home</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            token: 'tok',
            user: { ...mockUser, is_guest: true },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
