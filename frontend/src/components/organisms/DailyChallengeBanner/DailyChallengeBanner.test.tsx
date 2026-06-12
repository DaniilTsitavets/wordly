import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { DailyChallengeBanner } from './DailyChallengeBanner'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

describe('DailyChallengeBanner', () => {
  it('renders the title and stats', () => {
    renderWithProviders(<DailyChallengeBanner />)
    expect(screen.getByRole('heading', { name: 'Idiom Master Challenge' })).toBeInTheDocument()
    expect(screen.getByText(/5 Idioms/)).toBeInTheDocument()
    expect(screen.getByText(/2–3 min/)).toBeInTheDocument()
  })

  it('navigates to /daily-challenge on Play Now', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DailyChallengeBanner />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    )
    await userEvent.click(screen.getByRole('button', { name: /Play Now/ }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/daily-challenge')
  })
})
