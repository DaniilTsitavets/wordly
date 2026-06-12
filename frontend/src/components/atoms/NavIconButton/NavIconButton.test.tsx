import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavIconButton } from './NavIconButton'

describe('NavIconButton', () => {
  it('renders icon and label', () => {
    render(<NavIconButton icon={<span data-testid="i" />} aria-label="home" />)
    expect(screen.getByRole('button', { name: 'home' })).toBeInTheDocument()
  })

  it('marks aria-current=page when active', () => {
    render(<NavIconButton icon={<span />} aria-label="home" isActive />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'page')
  })

  it('omits aria-current when not active', () => {
    render(<NavIconButton icon={<span />} aria-label="home" />)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-current')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<NavIconButton icon={<span />} aria-label="home" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
