import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeGoalModal } from './ChangeGoalModal'

describe('ChangeGoalModal', () => {
  const baseProps = {
    currentWords: 10,
    isSaving: false,
    onClose: vi.fn(),
    onSave: vi.fn(),
  }

  it('renders three goal options', () => {
    render(<ChangeGoalModal {...baseProps} />)
    expect(screen.getByText('5 words')).toBeInTheDocument()
    expect(screen.getByText('10 words')).toBeInTheDocument()
    expect(screen.getByText('20 words')).toBeInTheDocument()
  })

  it('marks the currentWords option as active and disables Save initially', () => {
    render(<ChangeGoalModal {...baseProps} currentWords={10} />)
    const radios = screen.getAllByRole('radio')
    const tenWords = radios.find((r) => r.textContent?.includes('10 words'))!
    expect(tenWords).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('button', { name: 'Save Goal' })).toBeDisabled()
  })

  it('enables Save once a different option is selected and emits the new value', async () => {
    const onSave = vi.fn()
    render(<ChangeGoalModal {...baseProps} onSave={onSave} />)

    const radios = screen.getAllByRole('radio')
    const fiveWords = radios.find((r) => r.textContent?.includes('5 words'))!
    await userEvent.click(fiveWords)

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
    // Save button gets aria-busy via Button.isLoading; the close button does not.
    const busyButtons = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-busy') === 'true')
    expect(busyButtons).toHaveLength(1)
  })
})
