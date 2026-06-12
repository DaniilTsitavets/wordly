import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmModal } from './DeleteConfirmModal'

describe('DeleteConfirmModal', () => {
  const baseProps = {
    isOpen: true,
    itemName: 'Apple',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders nothing when closed', () => {
    render(<DeleteConfirmModal {...baseProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the item name in the title', () => {
    render(<DeleteConfirmModal {...baseProps} />)
    expect(screen.getByText('Delete "Apple"?')).toBeInTheDocument()
  })

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmModal {...baseProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmModal {...baseProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows loading state on Delete button when isLoading=true', () => {
    render(<DeleteConfirmModal {...baseProps} isLoading />)
    const buttons = screen.getAllByRole('button')
    const deleteBtn = buttons.find((b) => b.getAttribute('aria-busy') === 'true')
    expect(deleteBtn).toBeTruthy()
  })
})
