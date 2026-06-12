import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Body
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with content when open', () => {
    render(
      <Modal isOpen onClose={() => {}}>
        Body
      </Modal>
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('Body')
  })

  it('exposes ariaLabel on the dialog', () => {
    render(
      <Modal isOpen onClose={() => {}} ariaLabel="My modal">
        x
      </Modal>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'My modal')
  })

  it('calls onClose when clicking the overlay', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        x
      </Modal>
    )
    const overlay = screen.getByRole('presentation')
    await userEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('does NOT close when clicking the dialog body', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        x
      </Modal>
    )
    await userEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        x
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking the close button', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        x
      </Modal>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('locks body scroll while open and restores it on unmount', () => {
    const { unmount } = render(
      <Modal isOpen onClose={() => {}}>
        x
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
