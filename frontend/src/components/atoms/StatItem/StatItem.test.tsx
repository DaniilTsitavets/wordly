import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatItem } from './StatItem'

describe('StatItem', () => {
  it('renders value and label', () => {
    render(<StatItem icon={<span data-testid="i" />} value={120} label="Points" />)
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Points')).toBeInTheDocument()
    expect(screen.getByTestId('i')).toBeInTheDocument()
  })

  it('composes the accessible name as "{label}: {value}"', () => {
    render(<StatItem icon={<span />} value={7} label="Day Streak" />)
    expect(screen.getByRole('group', { name: 'Day Streak: 7' })).toBeInTheDocument()
  })
})
