import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatButton } from './StatButton'

describe('StatButton', () => {
  it('renders icon and value', () => {
    render(<StatButton icon={<span data-testid="i" />} value={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByTestId('i')).toBeInTheDocument()
  })

  it('applies background when not active', () => {
    render(<StatButton icon={<span />} value="x" background="#abc" />)
    expect(screen.getByRole('button')).toHaveStyle({ background: '#abc' })
  })

  it('skips inline background when active', () => {
    render(<StatButton icon={<span />} value="x" background="#abc" isActive />)
    const btn = screen.getByRole('button')
    expect(btn.style.background).toBe('')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<StatButton icon={<span />} value="x" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
