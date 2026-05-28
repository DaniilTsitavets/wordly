import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { GoalOptionButton } from '@/components/atoms/GoalOptionButton'
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
    <Modal isOpen onClose={onClose} ariaLabel="Change daily word goal" size="compact">
      <div className={styles.content}>
        <h2 className={styles.title}>Daily Word Goal</h2>
        <p className={styles.subtitle}>How many words do you want to learn each day?</p>

        <div className={styles.options} role="radiogroup" aria-label="Daily word goal">
          {GOAL_OPTIONS.map((option) => (
            <GoalOptionButton
              key={option.words}
              words={option.words}
              label={option.label}
              icon={option.icon}
              isActive={selected === option.words}
              onSelect={setSelected}
            />
          ))}
        </div>

        <Button
          variant="gradient"
          size="md"
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
