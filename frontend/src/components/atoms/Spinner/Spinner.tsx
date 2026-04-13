import styles from './Spinner.module.scss'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  label?: string
  className?: string
}

const sizes: Record<SpinnerSize, { dimension: number; stroke: number }> = {
  sm: { dimension: 80, stroke: 7 },
  md: { dimension: 140, stroke: 9 },
  lg: { dimension: 200, stroke: 11.2 },
}

export const Spinner = ({ size = 'md', label, className = '' }: SpinnerProps) => {
  const { dimension, stroke } = sizes[size]
  const r = (dimension - stroke) / 2
  const cx = dimension / 2
  const cy = dimension / 2
  const circumference = 2 * Math.PI * r
  const dasharray = `${circumference * 0.75} ${circumference * 0.25}`
  const gradientId = `spinner-gradient-${size}`

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <svg
        className={styles.spinner}
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        aria-hidden="true"
        role="img"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A268FF" />
            <stop offset="100%" stopColor="#FF6EA9" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeDasharray={dasharray}
          strokeDashoffset={0}
        />
      </svg>
      {label && (
        <span className={styles.label} aria-live="polite">
          {label}
        </span>
      )}
      <span className="sr-only">Загрузка...</span>
    </div>
  )
}
