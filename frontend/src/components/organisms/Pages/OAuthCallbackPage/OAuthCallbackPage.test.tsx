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
      { route: '/oauth/callback?code=abc' }
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
      { route: '/oauth/callback?code=abc' }
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

    renderWithProviders(<OAuthCallbackPage />, { route: '/oauth/callback?code=abc' })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('invalid grant'))
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
