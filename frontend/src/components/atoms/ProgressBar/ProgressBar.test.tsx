import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with aria-valuenow', () => {
    render(<ProgressBar value={42} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps values above 100 to 100', () => {
    render(<ProgressBar value={250} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('clamps negative values to 0', () => {
    render(<ProgressBar value={-10} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('uses custom label for aria-label when provided', () => {
    render(<ProgressBar value={30} label="Words learned" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Words learned')
    expect(screen.getByText('Words learned')).toBeInTheDocument()
  })

  it('falls back to "Progress N%" aria-label otherwise', () => {
    render(<ProgressBar value={30} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Progress 30%')
  })

  it('shows the value when showValue is true', () => {
    render(<ProgressBar value={30} showValue />)
    expect(screen.getByText('30%')).toBeInTheDocument()
  })
})
