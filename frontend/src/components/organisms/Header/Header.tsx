import { Avatar } from '../../atoms/Avatar'
import { StatButton } from '../../atoms/StatButton'
import {
  WordlyLogo,
  FireIcon,
  TrophyIcon,
  BookIcon,
  BrainIcon,
  TrendingIcon,
} from '../../../assets/icons'
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
            icon={<FireIcon />}
            value={streak}
            background="#FCEDE3"
            aria-label={`Daily streak: ${streak}`}
          />
          <span className={styles.tooltip}>Daily Streak</span>
        </div>

        <div className={styles.tooltipWrapper}>
          <StatButton
            icon={<TrophyIcon color="#F0B100" size={18} />}
            value={points}
            background="#FFFDF0"
            aria-label={`Total points: ${points}`}
          />
          <span className={styles.tooltip}>Total Points</span>
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.navIcons}>
          <button className={styles.navBtn} aria-label="Books">
            <BookIcon />
            <span className={styles.tooltip}>Books</span>
          </button>
          <button className={styles.navBtn} aria-label="Recall">
            <BrainIcon />
            <span className={styles.tooltip}>Recall</span>
          </button>
          <button className={styles.navBtn} aria-label="Progress">
            <TrendingIcon />
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
