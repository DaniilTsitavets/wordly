import type { ButtonHTMLAttributes } from 'react'
import styles from './LetterTile.module.scss'

type LetterTileState = 'default' | 'correct' | 'incorrect'

interface LetterTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  letter: string
  state?: LetterTileState
}

export const LetterTile = ({
  letter,
  state = 'default',
  className = '',
  ...props
}: LetterTileProps) => {
  return (
    <button
      className={`${styles.tile} ${styles[state]} ${className}`}
      aria-label={`Letter ${letter}`}
      aria-pressed={state === 'correct'}
      {...props}
    >
      {letter}
    </button>
  )
}
