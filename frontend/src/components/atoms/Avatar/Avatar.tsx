import styles from './Avatar.module.scss'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
  onClick?: () => void
  className?: string
}

const fontSizes: Record<AvatarSize, string> = {
  sm: '11px',
  md: '16px',
  lg: '22px',
  xl: '28px',
}

export const Avatar = ({
  src,
  alt = 'User avatar',
  fallback,
  size = 'md',
  onClick,
  className = '',
}: AvatarProps) => {
  return (
    <button
      className={`${styles.avatar} ${styles[size]} ${className}`}
      onClick={onClick}
      aria-label="Перейти в профиль"
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div
          className={styles.placeholder}
          aria-hidden="true"
          style={{ fontSize: fontSizes[size] }}
        >
          {fallback ?? '?'}
        </div>
      )}
    </button>
  )
}
