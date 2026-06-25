import { useState } from 'react'
import { AlarmIcon } from '@/assets/icons'
import styles from './DailyChallengeResultModal.module.scss'

export interface IdiomEntry {
  idiom: string
  translation: string
}

interface DailyChallengeResultModalProps {
  score: number
  total: number
  idioms: IdiomEntry[]
  isCorrect?: boolean
  onGoHome: () => void
  onOverlayClick: () => void
}

export function DailyChallengeResultModal({
  score,
  total,
  idioms,
  onGoHome,
  onOverlayClick,
}: DailyChallengeResultModalProps) {
  const [listOpen, setListOpen] = useState(false)

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onOverlayClick()}
    >
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.iconWrap}>
          <AlarmIcon size={56} />
        </div>

        {/* Text */}
        <div className={styles.textGroup}>
          <h2 className={styles.title}>Come Back Tomorrow!</h2>
          <p className={styles.subtitle}>
            You&apos;ve already completed today&apos;s idiom challenge!
          </p>
        </div>

        {/* Score */}
        <div className={styles.scoreBox}>
          <div className={styles.scoreNumber}>
            {score}/{total}
          </div>
          <div className={styles.scoreLabel}>Today&apos;s Score</div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.btnPrimary} onClick={onGoHome}>
            Back to Home
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setListOpen((o) => !o)}
            aria-expanded={listOpen}
          >
            {listOpen ? 'Hide List ▲' : 'Show Full List ▼'}
          </button>
        </div>

        {/* Inline expanding idiom list */}
        <div className={`${styles.listDrawer} ${listOpen ? styles.listDrawerOpen : ''}`}>
          <div className={styles.listPanel}>
            <div className={styles.listHeader}>
              <span>💡</span>
              <span>Today&apos;s Idioms</span>
            </div>
            {idioms.map((entry, idx) => (
              <div key={idx} className={styles.listItem}>
                <span className={styles.listIdiom}>&quot;{entry.idiom}&quot;</span>
                <span className={styles.listAnswer}>{entry.translation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
