import type { ReactNode } from 'react'
import styles from './StatItem.module.scss'

interface StatItemProps {
  icon: ReactNode
  value: number | string
  label: string
  className?: string
}

export const StatItem = ({ icon, value, label, className = '' }: StatItemProps) => {
  return (
    <div
      className={`${styles.wrapper} ${className}`}
      role="group"
      aria-label={`${label}: ${value}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
