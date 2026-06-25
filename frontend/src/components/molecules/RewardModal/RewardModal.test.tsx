import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RewardModal } from './RewardModal'

describe('RewardModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCollect: vi.fn(),
  }

  it('returns nothing when closed', () => {
    render(<RewardModal {...baseProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders default reward and "level 1" copy', () => {
    render(<RewardModal {...baseProps} />)
    expect(screen.getByText('Level Complete!')).toBeInTheDocument()
    expect(screen.getByText(/Congratulations on completing level 1/)).toBeInTheDocument()
    expect(screen.getByText('+10 Gems')).toBeInTheDocument()
  })

  it('uses custom numeric completion target as "level N"', () => {
    render(<RewardModal {...baseProps} completionTarget={3} />)
    expect(screen.getByText(/level 3/)).toBeInTheDocument()
  })

  it('uses string completion target verbatim', () => {
    render(<RewardModal {...baseProps} completionTarget="all levels" />)
    expect(screen.getByText(/Congratulations on completing all levels/)).toBeInTheDocument()
  })

  it('calls onCollect when Collect Reward is clicked', async () => {
    const onCollect = vi.fn()
    render(<RewardModal {...baseProps} onCollect={onCollect} />)
    await userEvent.click(screen.getByRole('button', { name: /Collect reward/ }))
    expect(onCollect).toHaveBeenCalled()
  })

  it('hides the gems block and switches the button to "Continue" when hideReward is set', async () => {
    const onCollect = vi.fn()
    render(<RewardModal {...baseProps} reward="+0 Gems" hideReward onCollect={onCollect} />)
    expect(screen.queryByText('+0 Gems')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Reward:/)).not.toBeInTheDocument()
    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button).toBeInTheDocument()
    await userEvent.click(button)
    expect(onCollect).toHaveBeenCalled()
  })
})
