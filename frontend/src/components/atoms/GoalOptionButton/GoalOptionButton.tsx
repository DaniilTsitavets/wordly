import { IconFont } from '@/components/atoms/IconFont'
import styles from './GoalOptionButton.module.scss'

interface GoalOptionButtonProps {
  words: number
  label: string
  icon: string
  isActive: boolean
  onSelect: (words: number) => void
}

export function GoalOptionButton({
  words,
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
      onClick={() => onSelect(words)}
    >
      <IconFont name={icon} size={22} decorative />
      <span className={styles.optionMinutes}>{words} words</span>
      <span className={styles.optionLabel}>{label}</span>
    </button>
  )
}
