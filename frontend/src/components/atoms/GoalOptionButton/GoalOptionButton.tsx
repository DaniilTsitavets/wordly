import { IconFont } from '@/components/atoms/IconFont'
import styles from './GoalOptionButton.module.scss'

interface GoalOptionButtonProps {
  minutes: number
  label: string
  icon: string
  isActive: boolean
  onSelect: (minutes: number) => void
}

export function GoalOptionButton({
  minutes,
  label,
  icon,
  isActive,
  onSelect,
}: GoalOptionButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
      onClick={() => onSelect(minutes)}
    >
      <IconFont name={icon} size={22} decorative />
      <span className={styles.optionMinutes}>{minutes} min</span>
      <span className={styles.optionLabel}>{label}</span>
    </button>
  )
}
