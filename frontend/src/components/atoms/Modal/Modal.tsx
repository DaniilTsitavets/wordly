import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { IconFont } from '@/components/atoms/IconFont'
import styles from './Modal.module.scss'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children?: ReactNode
  ariaLabel?: string
}

export const Modal = ({ isOpen, onClose, children, ariaLabel = 'Modal' }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // закрытие по Escape — AA requirement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // фокус внутри модалки — AA requirement
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.decorTop} aria-hidden="true" />
        <div className={styles.decorBottom} aria-hidden="true" />

        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрыть модальное окно"
        >
          <IconFont name="cross2" size={16} color="#6B7280" decorative />
        </button>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
