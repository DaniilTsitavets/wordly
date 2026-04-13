import styles from './PaginationDots.module.scss'

type PaginationColor = 'mixed' | 'purple' | 'pink'

interface PaginationDotsProps {
  total?: number
  color?: PaginationColor
  label?: string
  className?: string
}

const colorMap: Record<PaginationColor, string[]> = {
  mixed: ['#B30065', '#CEB7FF', '#B30065'],
  purple: ['#CEB7FF', '#CEB7FF', '#CEB7FF'],
  pink: ['#B30065', '#B30065', '#B30065'],
}

export const PaginationDots = ({
  total = 3,
  color = 'mixed',
  label,
  className = '',
}: PaginationDotsProps) => {
  const colors = colorMap[color]

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.dots} role="status" aria-label={label ?? 'Загрузка...'}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={styles.dot}
            style={{ backgroundColor: colors[i % colors.length] }}
          />
        ))}
      </div>
      {label && (
        <span className={styles.label} aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  )
}
