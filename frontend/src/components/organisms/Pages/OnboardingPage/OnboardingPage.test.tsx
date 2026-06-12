import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { OnboardingPage } from './OnboardingPage'

const url = (path: string) => `${API_BASE_URL}${path}`

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

describe('OnboardingPage', () => {
  it('renders the DailyGoal selector', () => {
    renderWithProviders(<OnboardingPage />)
    expect(screen.getByRole('heading', { name: 'Daily Study Time' })).toBeInTheDocument()
  })

  it('submits the selected goal and navigates to /', async () => {
    server.use(
      http.put(url('/users/me'), () =>
        HttpResponse.json({ ...mockUser, daily_goal_min: 15, onboarding_completed: true })
      )
    )

    const { store } = renderWithProviders(
      <Routes>
        <Route path="/onboarding/daily-goal" element={<OnboardingPage />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: '/onboarding/daily-goal' }
    )

    await userEvent.click(screen.getByRole('button', { name: /Let's Start/ }))
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('/'))
    expect(store.getState().auth.user?.daily_goal_min).toBe(15)
  })

  it('shows error and stays on page when update fails', async () => {
    server.use(
      http.put(url('/users/me'), () => HttpResponse.json({ message: 'no save' }, { status: 500 }))
    )

    renderWithProviders(<OnboardingPage />)
    await userEvent.click(screen.getByRole('button', { name: /Let's Start/ }))
    await waitFor(() => expect(screen.getByText('no save')).toBeInTheDocument())
  })
})
