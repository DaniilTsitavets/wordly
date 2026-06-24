import { IconFont } from '@/components/atoms/IconFont'
import styles from './GoalOptionButton.module.scss'

interface GoalOptionButtonProps {
  words: number
  label: string
  icon: string
  isActive: boolean
  unit?: string
  onSelect: (words: number) => void
}

export function GoalOptionButton({
  words,
  label,
  icon,
  isActive,
  unit = 'words',
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
      <span className={styles.optionMinutes}>{words} {unit}</span>
      <span className={styles.optionLabel}>{label}</span>
    </button>
  )
}
