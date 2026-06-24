import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { OAuthCallbackPage } from './OAuthCallbackPage'

const url = (path: string) => `${API_BASE_URL}${path}`

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

describe('OAuthCallbackPage', () => {
  it('shows "Missing authorization code" when no code in query', () => {
    renderWithProviders(<OAuthCallbackPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('Missing authorization code')
  })

  it('surfaces ?error= from Google', () => {
    renderWithProviders(<OAuthCallbackPage />, { route: '/oauth/callback?error=access_denied' })
    expect(screen.getByRole('alert')).toHaveTextContent('access_denied')
  })

  // Each test below uses a unique `code=` value because the page dedupes
  // exchange attempts at module scope — sharing a code across tests would
  // make the second test short-circuit and never hit the network.
  it('exchanges the code and dispatches loginSuccess', async () => {
    server.use(
      http.post(url('/auth/oauth/google'), () =>
        HttpResponse.json({ access_token: 'google-tok', user: { ...mockUser } })
      )
    )

    const { store } = renderWithProviders(
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/" element={<LocationProbe />} />
        <Route path="/onboarding/daily-goal" element={<LocationProbe />} />
      </Routes>,
      { route: '/oauth/callback?code=code-success' }
    )

    await waitFor(() => expect(store.getState().auth.token).toBe('google-tok'))
  })

  it('redirects to onboarding when onboarding_completed is false', async () => {
    server.use(
      http.post(url('/auth/oauth/google'), () =>
        HttpResponse.json({
          access_token: 'google-tok',
          user: { ...mockUser, onboarding_completed: false },
        })
      )
    )

    renderWithProviders(
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/onboarding/daily-goal" element={<LocationProbe />} />
      </Routes>,
      { route: '/oauth/callback?code=code-onboarding' }
    )

    await waitFor(() =>
      expect(screen.getByTestId('loc')).toHaveTextContent('/onboarding/daily-goal')
    )
  })

  it('renders the error returned by the backend', async () => {
    server.use(
      http.post(url('/auth/oauth/google'), () =>
        HttpResponse.json({ message: 'invalid grant' }, { status: 400 })
      )
    )

    renderWithProviders(<OAuthCallbackPage />, { route: '/oauth/callback?code=code-error' })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('invalid grant'))
  })

  it('exchanges each code at most once — a remount with the same code is a no-op', async () => {
    // Simulates the production race: the first exchange succeeds, the Outlet
    // remounts because auth state changed, and the page mounts a second time
    // with the same `?code=` still in the URL. The second mount must NOT
    // re-hit the backend — otherwise Google rejects the already-used code
    // and the user sees "Google authentication failed" over an already-
    // logged-in session.
    let calls = 0
    server.use(
      http.post(url('/auth/oauth/google'), () => {
        calls += 1
        return HttpResponse.json({ access_token: 'google-tok', user: { ...mockUser } })
      })
    )

    const { unmount } = renderWithProviders(<OAuthCallbackPage />, {
      route: '/oauth/callback?code=code-dedupe',
    })
    await waitFor(() => expect(calls).toBe(1))
    unmount()

    renderWithProviders(<OAuthCallbackPage />, { route: '/oauth/callback?code=code-dedupe' })
    // give any spurious effect a chance to fire
    await new Promise((r) => setTimeout(r, 30))
    expect(calls).toBe(1)
  })

  it('navigates away when mounted with an already-real user in the store', async () => {
    // Mirrors the post-`<Outlet>`-remount situation: the first instance
    // already exchanged the code and put a real user in Redux, then a new
    // instance mounts on the same `/oauth/callback?code=…` URL because the
    // Outlet re-keyed. The dedupe guard makes that mount a no-op against
    // the backend, but the page still needs to leave — driven by the user
    // it now sees in Redux.
    renderWithProviders(
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/" element={<LocationProbe />} />
        <Route path="/onboarding/daily-goal" element={<LocationProbe />} />
      </Routes>,
      {
        route: '/oauth/callback?code=code-already-logged-in',
        preloadedState: {
          auth: {
            token: 'preexisting-tok',
            user: { ...mockUser, is_guest: false, onboarding_completed: true },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('/'))
  })

  it('still dispatches loginSuccess when the instance unmounts mid-exchange', async () => {
    // Mirrors the production race where Layout's getMe wins, the Outlet
    // re-keys on the resulting setUser(guest), and the OAuthCallbackPage
    // instance gets torn down before its exchange resolves. The real user
    // returned by the exchange must still land in Redux — otherwise the
    // app stays on the guest session forever.
    let resolveExchange!: () => void
    const exchangeReady = new Promise<void>((r) => {
      resolveExchange = r
    })
    server.use(
      http.post(url('/auth/oauth/google'), async () => {
        await exchangeReady
        return HttpResponse.json({
          access_token: 'real-tok',
          user: { ...mockUser, is_guest: false, onboarding_completed: true },
        })
      })
    )

    const { unmount, store } = renderWithProviders(<OAuthCallbackPage />, {
      route: '/oauth/callback?code=code-race-unmount',
    })

    // Tear down the page before the exchange resolves, then let it resolve.
    unmount()
    resolveExchange()

    await waitFor(() => expect(store.getState().auth.token).toBe('real-tok'))
    expect(store.getState().auth.user?.is_guest).toBe(false)
  })

  it('clicking "Back to home" navigates to /', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: '/oauth/callback' }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Back to home' }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/')
  })
})
