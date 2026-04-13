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
  className = '',
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={className}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#1a1a1a',
          }}
        >
          {label && <span>{label}</span>}
          {showValue && <span>{clamped}%</span>}
        </div>
      )}
      <div
        className={`${styles.container} ${styles[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progress ${clamped}%`}
      >
        <div className={`${styles.bar} ${styles[color]}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
