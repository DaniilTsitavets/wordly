import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DailyChallengeResultModal } from './DailyChallengeResultModal'

const baseProps = {
  score: 3,
  total: 5,
  idioms: [
    { idiom: 'kick the bucket', translation: 'умереть' },
    { idiom: 'piece of cake', translation: 'легко' },
  ],
  onGoHome: vi.fn(),
  onOverlayClick: vi.fn(),
}

describe('DailyChallengeResultModal', () => {
  it('renders score X/Y', () => {
    render(<DailyChallengeResultModal {...baseProps} />)
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('renders title and subtitle', () => {
    render(<DailyChallengeResultModal {...baseProps} />)
    expect(screen.getByText('Come Back Tomorrow!')).toBeInTheDocument()
    expect(screen.getByText(/already completed/)).toBeInTheDocument()
  })

  it('calls onGoHome from Back to Home', async () => {
    const onGoHome = vi.fn()
    render(<DailyChallengeResultModal {...baseProps} onGoHome={onGoHome} />)
    await userEvent.click(screen.getByRole('button', { name: 'Back to Home' }))
    expect(onGoHome).toHaveBeenCalled()
  })

  it('toggles the idiom list expander', async () => {
    render(<DailyChallengeResultModal {...baseProps} />)
    const toggle = screen.getByRole('button', { name: /Show Full List/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Hide List/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('renders all idioms in the list', () => {
    render(<DailyChallengeResultModal {...baseProps} />)
    expect(screen.getByText(/kick the bucket/)).toBeInTheDocument()
    expect(screen.getByText('умереть')).toBeInTheDocument()
    expect(screen.getByText(/piece of cake/)).toBeInTheDocument()
    expect(screen.getByText('легко')).toBeInTheDocument()
  })

  it('calls onOverlayClick when the overlay (not the card) is clicked', async () => {
    const onOverlayClick = vi.fn()
    const { container } = render(
      <DailyChallengeResultModal {...baseProps} onOverlayClick={onOverlayClick} />
    )
    const overlay = container.firstChild as HTMLElement
    await userEvent.click(overlay)
    expect(onOverlayClick).toHaveBeenCalled()
  })

  it('does NOT call onOverlayClick when clicking the card', async () => {
    const onOverlayClick = vi.fn()
    render(<DailyChallengeResultModal {...baseProps} onOverlayClick={onOverlayClick} />)
    await userEvent.click(screen.getByText('3/5'))
    expect(onOverlayClick).not.toHaveBeenCalled()
  })
})
