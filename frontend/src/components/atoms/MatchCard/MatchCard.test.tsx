import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MatchCard } from './MatchCard'

describe('MatchCard', () => {
  it('renders children', () => {
    render(<MatchCard>cat</MatchCard>)
    expect(screen.getByRole('button', { name: 'cat' })).toBeInTheDocument()
  })

  it('default state is not pressed', () => {
    render(<MatchCard>x</MatchCard>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('is pressed for non-default state (selected/correct/incorrect)', () => {
    const { rerender } = render(<MatchCard state="selected">x</MatchCard>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')

    rerender(<MatchCard state="correct">x</MatchCard>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')

    rerender(<MatchCard state="incorrect">x</MatchCard>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<MatchCard onClick={onClick}>x</MatchCard>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
