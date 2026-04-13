import { Modal } from '@/app/components/atoms/Modal'
import { IconFont } from '@/app/components/atoms/IconFont'
import styles from './RewardModal.module.scss'

interface RewardModalProps {
  isOpen: boolean
  onClose: () => void
  onCollect: () => void
  level?: number
  reward?: string
}

export const RewardModal = ({
  isOpen,
  onClose,
  onCollect,
  level = 1,
  reward = '+10 Gems',
}: RewardModalProps) => {
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
          <p className={styles.subtitle}>Congratulations on completing level {level}</p>
        </div>

        <div className={styles.rewardBox} aria-label={`Reward: ${reward}`}>
          <div className={styles.rewardIconWrapper} aria-hidden="true">
            <IconFont name="diamond" size={28} color="#ffffff" decorative />
          </div>
          <div className={styles.rewardInfo}>
            <span className={styles.rewardLabel}>Reward</span>
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
