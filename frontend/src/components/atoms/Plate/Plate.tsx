import type { ReactNode } from 'react'
import styles from './Plate.module.scss'

type PlateVariant = 'default' | 'outlined' | 'elevated'

interface PlateProps {
  variant?: PlateVariant
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

export const Plate = ({
  variant = 'default',
  icon,
  title,
  description,
  className = '',
}: PlateProps) => {
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
