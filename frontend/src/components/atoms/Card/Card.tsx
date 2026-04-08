import type { ReactNode } from 'react'
import styles from './Card.module.scss'

type CardVariant = 'default' | 'outlined' | 'elevated'

interface CardProps {
  variant?: CardVariant
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

export const Card = ({
  variant = 'default',
  icon,
  title,
  description,
  className = '',
}: CardProps) => {
  return (
    <div className={`${styles.card} ${styles[variant]} ${className}`}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  )
}
