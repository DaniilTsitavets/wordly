import { Modal } from '@/components/atoms/Modal'
import { IconFont } from '@/components/atoms/IconFont'
import styles from './RewardModal.module.scss'

interface RewardModalProps {
  isOpen: boolean
  onClose: () => void
  onCollect: () => void
  completionTarget?: number | string
  reward?: string
}

export const RewardModal = ({
  isOpen,
  onClose,
  onCollect,
  completionTarget = 1,
  reward = '+10 Gems',
}: RewardModalProps) => {
  let completionText = String(completionTarget)
  if (typeof completionTarget === 'number') {
    completionText = `level ${completionTarget}`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Reward modal">
      <div className={styles.modal}>
        <div style={{ position: 'relative' }}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <IconFont name="diamond-white" size={48} decorative />
          </div>
          <span className={styles.sparkleTopRight} aria-hidden="true">
            <IconFont name="sparkle" size={20} color="#a268ff" decorative />
          </span>
          <span className={styles.sparkleBottomLeft} aria-hidden="true">
            <IconFont name="sparkle" size={20} color="#a268ff" decorative />
          </span>
        </div>

        <div className={styles.texts}>
          <h2 className={styles.title}>Level Complete!</h2>
          <p className={styles.subtitle}>Congratulations on completing {completionText}</p>
        </div>

        <div className={styles.rewardBox} aria-label={`Reward: ${reward}`}>
          <div className={styles.rewardIconWrapper} aria-hidden="true">
            <IconFont name="diamond" size={28} color="#ffffff" decorative />
          </div>
          <div className={styles.rewardInfo}>
            <span className={styles.rewardValue}>{reward}</span>
          </div>
        </div>

        <button
          className={styles.collectButton}
          onClick={onCollect}
          aria-label={`Collect reward: ${reward}`}
        >
          Collect Reward
        </button>
      </div>
    </Modal>
  )
}
