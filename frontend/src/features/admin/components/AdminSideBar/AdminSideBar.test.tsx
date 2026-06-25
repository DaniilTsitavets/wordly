import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { AdminSideBar } from './AdminSideBar'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

describe('AdminSideBar', () => {
  it('renders the 4 nav links and the Back button', () => {
    renderWithProviders(<AdminSideBar />)
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Topics/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Subtopics/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Words/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back to Wordly/ })).toBeInTheDocument()
  })

  it('navigates to / when Back to Wordly is clicked', async () => {
    renderWithProviders(
      <Routes>
        <Route path="*" element={<AdminSideBar />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: '/admin/dashboard' }
    )

    await userEvent.click(screen.getByRole('button', { name: /Back to Wordly/ }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/')
  })
})
