import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { NavLinks } from './NavLinks'
import { AuthenticatedNav } from './AuthenticatedNav'
import { UnauthenticatedNav } from './UnauthenticatedNav'

describe('NavLinks', () => {
  it('renders the authenticated nav by default', () => {
    renderWithProviders(<NavLinks stats={{ fire: 5, gems: 7 }} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders the unauthenticated nav when isAuthenticated=false', () => {
    renderWithProviders(<NavLinks isAuthenticated={false} />)
    // Unauth nav uses icon-only links with `data-label` (no accessible name),
    // so we match by href.
    const links = screen.getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/login', '/info'])
  })
})

describe('AuthenticatedNav', () => {
  it('renders fire + gems tooltips and three nav links', () => {
    renderWithProviders(<AuthenticatedNav stats={{ fire: 3, gems: 9 }} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('defaults stats to 0/0 when not provided', () => {
    renderWithProviders(<AuthenticatedNav />)
    expect(screen.getAllByText('0')).toHaveLength(2)
  })
})

describe('UnauthenticatedNav', () => {
  it('renders Login and About Us links', () => {
    renderWithProviders(<UnauthenticatedNav />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/login')
    expect(links[1]).toHaveAttribute('href', '/info')
  })
})
