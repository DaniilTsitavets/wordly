import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './StatButton.module.scss'

interface StatButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  value: number | string
  background?: string
  isActive?: boolean
}

export const StatButton = ({
  icon,
  value,
  background = '#F3F4F6',
  isActive = false,
  className = '',
  ...props
}: StatButtonProps) => {
  return (
    <button
      className={`${styles.button} ${isActive ? styles.active : ''} ${className}`}
      style={!isActive ? { background } : {}}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{value}</span>
    </button>
  )
}
