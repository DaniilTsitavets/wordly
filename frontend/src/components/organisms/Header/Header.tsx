import { Avatar } from '../../atoms/Avatar'
import { StatButton } from '../../atoms/StatButton'
import { WordlyLogo } from '../../../assets/icons'
import { IconFont } from '../../atoms/IconFont'
import styles from './Header.module.scss'

interface HeaderProps {
  streak?: number
  points?: number
  onAvatarClick?: () => void
  avatarSrc?: string
  className?: string
}

export const Header = ({
  streak = 0,
  points = 50,
  onAvatarClick,
  avatarSrc,
  className = '',
}: HeaderProps) => {
  return (
    <header className={`${styles.header} ${className}`} role="banner">
      <div className={styles.left}>
        <WordlyLogo />
      </div>

      <div className={styles.center}>
        <div className={styles.tooltipWrapper}>
          <StatButton
            icon={<IconFont name="fire" />}
            value={streak}
            background="transparent"
            className={styles.statBtnFire}
            aria-label={`Daily streak: ${streak}`}
          />
          <span className={styles.tooltip}>Daily Streak</span>
        </div>

        <div className={styles.tooltipWrapper}>
          <StatButton
            icon={<IconFont name="diamond" size={18} color="#ff68e3" />}
            value={points}
            background="transparent"
            className={styles.statBtnDiamond}
            aria-label={`Total points: ${points}`}
          />
          <span className={styles.tooltip}>Total Points</span>
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.navIcons}>
          <button className={styles.navBtn} aria-label="Books">
            <IconFont name="book-colored" />
            <span className={styles.tooltip}>Books</span>
          </button>
          <button className={styles.navBtn} aria-label="Recall">
            <IconFont name="brain" />
            <span className={styles.tooltip}>Recall</span>
          </button>
          <button className={styles.navBtn} aria-label="Progress">
            <IconFont name="increase" />
            <span className={styles.tooltip}>Progress</span>
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <Avatar src={avatarSrc} onClick={onAvatarClick} />
      </div>
    </header>
  )
}
