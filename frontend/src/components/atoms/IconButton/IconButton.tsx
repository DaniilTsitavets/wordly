import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './IconButton.module.scss'

type IconButtonSize = 'sm' | 'md' | 'lg'
type IconButtonVariant = 'primary' | 'ghost'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  size?: IconButtonSize
  variant?: IconButtonVariant
  'aria-label': string
}

export const IconButton = ({
  icon,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={`${styles.iconButton} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
