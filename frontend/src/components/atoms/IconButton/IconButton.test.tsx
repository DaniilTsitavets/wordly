import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('renders icon and aria-label', () => {
    render(<IconButton icon={<span data-testid="i" />} aria-label="open" />)
    expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument()
    expect(screen.getByTestId('i')).toBeInTheDocument()
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<IconButton icon={<span />} aria-label="x" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('honors disabled', () => {
    render(<IconButton icon={<span />} aria-label="x" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })
})
