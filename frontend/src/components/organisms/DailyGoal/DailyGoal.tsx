import { useState } from 'react'
import { IconFont } from '@/components/atoms/IconFont'
import { Button } from '@/components/atoms/Button'
import styles from './DailyGoal.module.scss'

type GoalOption = 'light' | 'recommended' | 'intensive'

interface GoalConfig {
  id: GoalOption
  minutes: number
  label: string
  icon: string
}

const GOALS: GoalConfig[] = [
  { id: 'light', minutes: 5, label: 'Light & Easy', icon: 'coffe' },
  { id: 'recommended', minutes: 15, label: 'Steady Progress', icon: 'lightning' },
  { id: 'intensive', minutes: 30, label: 'Intensive Mode', icon: 'dumbbell' },
]

interface DailyGoalProps {
  onStart?: (minutes: number) => void
  isSubmitting?: boolean
}

export const DailyGoal = ({ onStart, isSubmitting = false }: DailyGoalProps) => {
  const [selected, setSelected] = useState<GoalOption>('recommended')

  const handleStart = () => {
    const goal = GOALS.find((g) => g.id === selected)
    if (goal) onStart?.(goal.minutes)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.step}>STEP 1 OF 1</p>
          <h1 className={styles.title}>Daily Study Time</h1>
        </div>
        <div className={styles.timerCircle}>
          <IconFont name="timer" size={24} color="#a268ff" ariaLabel="Timer" />
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} />
      </div>

      <div
        className={`${styles.recommendedCard} ${selected === 'recommended' ? styles.cardSelected : ''}`}
        onClick={() => setSelected('recommended')}
        role="radio"
        aria-checked={selected === 'recommended'}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setSelected('recommended')}
      >
        <div>
          <p className={styles.recommendedLabel}>RECOMMENDED</p>
          <p className={styles.time}>
            <span className={styles.timeNumber}>15</span> min
          </p>
          <p className={styles.timeLabel}>Steady Progress</p>
        </div>
        <div className={styles.lightningCircle}>
          <IconFont name="lightning" size={22} color="#6631db" decorative />
        </div>
      </div>

      <div className={styles.optionsGrid}>
        {GOALS.filter((g) => g.id !== 'recommended').map((goal) => (
          <div
            key={goal.id}
            className={`${styles.optionCard} ${selected === goal.id ? styles.cardSelected : ''}`}
            onClick={() => setSelected(goal.id)}
            role="radio"
            aria-checked={selected === goal.id}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(goal.id)}
          >
            <IconFont name={goal.icon} size={20} color="#6b7280" decorative />
            <p className={styles.time}>
              <span className={styles.timeNumber}>{goal.minutes}</span> min
            </p>
            <p className={styles.timeLabel}>{goal.label}</p>
          </div>
        ))}
      </div>

      <div className={styles.quote}>
        <IconFont name="sparkle" size={18} color="#a268ff" decorative />
        <p>"Consistency is key! Even 5 minutes a day builds a lasting habit."</p>
      </div>

      <Button
        variant="gradient"
        size="lg"
        className={styles.startBtn}
        rightIcon={<IconFont name="arrow-right" size={18} decorative />}
        onClick={handleStart}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving…' : "Let's Start!"}
      </Button>
    </div>
  )
}
