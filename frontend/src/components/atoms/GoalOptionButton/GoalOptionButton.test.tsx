import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoalOptionButton } from './GoalOptionButton'

describe('GoalOptionButton', () => {
  const baseProps = {
    words: 10,
    label: 'Steady',
    icon: 'lightning',
    isActive: false,
    onSelect: vi.fn(),
  }

  it('renders words count and label', () => {
    render(<GoalOptionButton {...baseProps} />)
    expect(screen.getByText('10 words')).toBeInTheDocument()
    expect(screen.getByText('Steady')).toBeInTheDocument()
  })

  it('exposes role=radio with aria-checked', () => {
    render(<GoalOptionButton {...baseProps} isActive />)
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true')
  })

  it('aria-checked=false when not active', () => {
    render(<GoalOptionButton {...baseProps} />)
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onSelect(words) when clicked', async () => {
    const onSelect = vi.fn()
    render(<GoalOptionButton {...baseProps} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('radio'))
    expect(onSelect).toHaveBeenCalledWith(10)
  })
})
