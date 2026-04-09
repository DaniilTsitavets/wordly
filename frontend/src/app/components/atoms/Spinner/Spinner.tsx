import { useId } from 'react'
import styles from './Spinner.module.scss'

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  ariaLabel?: string
}

export const Spinner = ({ size = 'md', className = '', ariaLabel = 'Loading' }: SpinnerProps) => {
  const gradientId = useId().replace(/:/g, '')

  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <svg className={styles.svg} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop className={styles.stopStart} offset="0%" />
            <stop className={styles.stopEnd} offset="100%" />
          </linearGradient>
        </defs>

        <circle className={styles.circle} cx="50" cy="50" r="42" stroke={`url(#${gradientId})`} />
      </svg>

      <span className={styles.visuallyHidden}>{ariaLabel}</span>
    </div>
  )
}
