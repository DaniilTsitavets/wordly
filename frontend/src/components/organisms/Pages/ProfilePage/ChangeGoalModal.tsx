import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import styles from './ChangeGoalModal.module.scss'

interface GoalOption {
  words: number
  label: string
  icon: string
}

const GOAL_OPTIONS: GoalOption[] = [
  { words: 5, label: 'Light & Easy', icon: 'coffe' },
  { words: 10, label: 'Steady Progress', icon: 'lightning' },
  { words: 20, label: 'Intensive Mode', icon: 'dumbbell' },
]

interface ChangeGoalModalProps {
  currentWords: number
  isSaving: boolean
  onClose: () => void
  onSave: (words: number) => void
}

export function ChangeGoalModal({ currentWords, isSaving, onClose, onSave }: ChangeGoalModalProps) {
  const [selected, setSelected] = useState(currentWords)

  return (
    <Modal isOpen onClose={onClose} ariaLabel="Change daily word goal">
      <div className={styles.content}>
        <h2 className={styles.title}>Daily Word Goal</h2>
        <p className={styles.subtitle}>How many words do you want to learn each day?</p>

        <div className={styles.options} role="radiogroup" aria-label="Daily word goal">
          {GOAL_OPTIONS.map((option) => {
            const isActive = selected === option.words
            return (
              <button
                key={option.words}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                onClick={() => setSelected(option.words)}
              >
                <IconFont name={option.icon} size={22} decorative />
                <span className={styles.optionMinutes}>{option.words} words</span>
                <span className={styles.optionLabel}>{option.label}</span>
              </button>
            )
          })}
        </div>

        <Button
          variant="gradient"
          size="lg"
          className={styles.saveBtn}
          isLoading={isSaving}
          disabled={selected === currentWords}
          onClick={() => onSave(selected)}
        >
          Save Goal
        </Button>
      </div>
    </Modal>
  )
}
