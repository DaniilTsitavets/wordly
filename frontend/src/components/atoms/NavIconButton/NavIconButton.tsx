import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './NavIconButton.module.scss'

interface NavIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  isActive?: boolean
  'aria-label': string
}

export const NavIconButton = ({
  icon,
  isActive = false,
  className = '',
  ...props
}: NavIconButtonProps) => {
  return (
    <button
      className={`${styles.button} ${isActive ? styles.active : ''} ${className}`}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
