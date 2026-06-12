import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsDisplay } from './StatsDisplay'

describe('StatsDisplay', () => {
  it('renders all three stat items', () => {
    render(<StatsDisplay />)
    expect(screen.getByRole('region', { name: 'Statistics' })).toBeInTheDocument()
    expect(screen.getByText('Points')).toBeInTheDocument()
    expect(screen.getByText('Day Streak')).toBeInTheDocument()
    expect(screen.getByText('Words')).toBeInTheDocument()
  })

  it('renders the static demo values 120 / 7 / 30', () => {
    render(<StatsDisplay />)
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })
})
