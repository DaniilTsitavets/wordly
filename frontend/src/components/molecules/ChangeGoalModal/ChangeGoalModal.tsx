import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { GoalOptionButton } from '@/components/atoms/GoalOptionButton'
import styles from './ChangeGoalModal.module.scss'

interface GoalOption {
  minutes: number
  label: string
  icon: string
}

// Matches the time-based daily goal presets from the onboarding flow
// (DailyGoal component) — light / steady / intensive.
const GOAL_OPTIONS: GoalOption[] = [
  { minutes: 5, label: 'Light & Easy', icon: 'coffe' },
  { minutes: 15, label: 'Steady Progress', icon: 'lightning' },
  { minutes: 30, label: 'Intensive Mode', icon: 'dumbbell' },
]

interface ChangeGoalModalProps {
  currentMinutes: number
  isSaving: boolean
  onClose: () => void
  onSave: (minutes: number) => void
}

export function ChangeGoalModal({
  currentMinutes,
  isSaving,
  onClose,
  onSave,
}: ChangeGoalModalProps) {
  const [selected, setSelected] = useState(currentMinutes)

  return (
    <Modal isOpen onClose={onClose} ariaLabel="Change daily time goal" size="compact">
      <div className={styles.content}>
        <h2 className={styles.title}>Daily Time Goal</h2>
        <p className={styles.subtitle}>How many minutes do you want to study each day?</p>

        <div className={styles.options} role="radiogroup" aria-label="Daily time goal">
          {GOAL_OPTIONS.map((option) => (
            <GoalOptionButton
              key={option.minutes}
              minutes={option.minutes}
              label={option.label}
              icon={option.icon}
              isActive={selected === option.minutes}
              onSelect={setSelected}
            />
          ))}
        </div>

        <Button
          variant="gradient"
          size="md"
          className={styles.saveBtn}
          isLoading={isSaving}
          disabled={selected === currentMinutes}
          onClick={() => onSave(selected)}
        >
          Save Goal
        </Button>
      </div>
    </Modal>
  )
}
