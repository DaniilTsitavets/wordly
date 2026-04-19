import styles from './ProgressBar.module.scss'

type ProgressBarColor = 'purple' | 'green' | 'orange' | 'pink'
type ProgressBarSize = 'xs' | 'sm' | 'md'

interface ProgressBarProps {
  value: number // 0-100
  color?: ProgressBarColor
  size?: ProgressBarSize
  label?: string
  showValue?: boolean
  className?: string
}

export const ProgressBar = ({
  value,
  color = 'purple',
  size = 'sm',
  label,
  showValue = false,
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={styles.container}>
      <div
        className={`${styles.container__bar} ${styles[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progress ${clamped}%`}
      >
        <div className={`${styles.bar} ${styles[color]}`} style={{ width: `${clamped}%` }} />
      </div>
      {(label || showValue) && (
        <div className={styles.label}>
          {label && <span>{label}</span>}
          {showValue && <span>{clamped}%</span>}
        </div>
      )}
    </div>
  )
}
