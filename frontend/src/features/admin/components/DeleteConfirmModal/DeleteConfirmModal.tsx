import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import styles from './DeleteConfirmModal.module.scss'

interface DeleteConfirmModalProps {
  isOpen: boolean
  itemName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export const DeleteConfirmModal = ({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="compact" ariaLabel="Confirm deletion">
      <div className={styles.content}>
        <h3 className={styles.title}>Delete "{itemName}"?</h3>
        <p className={styles.message}>Are you sure you want to delete this item?</p>
        <div className={styles.actions}>
          <Button variant="primary" size="sm" onClick={onConfirm} isLoading={isLoading}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
