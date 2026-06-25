import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeGoalModal } from './ChangeGoalModal'

describe('ChangeGoalModal', () => {
  const baseProps = {
    currentMinutes: 15,
    isSaving: false,
    onClose: vi.fn(),
    onSave: vi.fn(),
  }

  it('renders three goal options (5 / 15 / 30 min)', () => {
    render(<ChangeGoalModal {...baseProps} />)
    expect(screen.getByText('5 min')).toBeInTheDocument()
    expect(screen.getByText('15 min')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('marks the currentMinutes option as active and disables Save initially', () => {
    render(<ChangeGoalModal {...baseProps} currentMinutes={15} />)
    const radios = screen.getAllByRole('radio')
    const fifteen = radios.find((r) => r.textContent?.includes('15 min'))!
    expect(fifteen).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('button', { name: 'Save Goal' })).toBeDisabled()
  })

  it('enables Save once a different option is selected and emits the new value', async () => {
    const onSave = vi.fn()
    render(<ChangeGoalModal {...baseProps} onSave={onSave} />)

    const radios = screen.getAllByRole('radio')
    const five = radios.find((r) => r.textContent?.includes('5 min'))!
    await userEvent.click(five)

    const save = screen.getByRole('button', { name: 'Save Goal' })
    expect(save).not.toBeDisabled()
    await userEvent.click(save)
    expect(onSave).toHaveBeenCalledWith(5)
  })

  it('calls onClose when the modal close button is clicked', async () => {
    const onClose = vi.fn()
    render(<ChangeGoalModal {...baseProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows loading state on the Save button when isSaving=true', () => {
    render(<ChangeGoalModal {...baseProps} isSaving />)
    const busyButtons = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-busy') === 'true')
    expect(busyButtons).toHaveLength(1)
  })
})
