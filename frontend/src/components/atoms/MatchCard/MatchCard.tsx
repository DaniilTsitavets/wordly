import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './MatchCard.module.scss'

type MatchCardState = 'default' | 'correct' | 'incorrect' | 'selected'

interface MatchCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  state?: MatchCardState
}

export const MatchCard = ({
  children,
  state = 'default',
  className = '',
  ...props
}: MatchCardProps) => {
  return (
    <button
      className={`${styles.card} ${styles[state]} ${className}`}
      aria-pressed={state !== 'default'}
      {...props}
    >
      {children}
    </button>
  )
}
