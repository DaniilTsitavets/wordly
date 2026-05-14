import { useState, useRef, useEffect } from 'react'
import { Avatar } from '../../atoms/Avatar'
import { StatButton } from '../../atoms/StatButton'
import { Button } from '../../atoms/Button'
import { WordlyLogo } from '../../../assets/icons'
import { IconFont } from '../../atoms/IconFont'
import styles from './Header.module.scss'

interface HeaderAuthProps {
  isAuthenticated: true
  streak?: number
  gems?: number
  onLogout: () => void
  onProfileClick?: () => void
  onVocabularyClick?: () => void
  onRecallClick?: () => void
  avatarSrc?: string
  onLoginClick?: never
  className?: string
}

interface HeaderGuestProps {
  isAuthenticated: false
  onLoginClick: () => void
  streak?: never
  gems?: never
  onLogout?: never
  avatarSrc?: never
  className?: string
}

type HeaderProps = HeaderAuthProps | HeaderGuestProps

export const Header = (props: HeaderProps) => {
  const { isAuthenticated, className = '' } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={`${styles.header} ${className}`} role="banner">
      <div className={styles.left}>
        <WordlyLogo />
      </div>

      {isAuthenticated ? (
        <div className={styles.center}>
          <div className={styles.tooltipWrapper}>
            <StatButton
              icon={<IconFont name="fire" />}
              value={props.streak ?? 0}
              background="transparent"
              className={styles.statBtnFire}
              aria-label={`Daily streak: ${props.streak ?? 0}`}
            />
            <span className={styles.tooltip}>Daily Streak</span>
          </div>

          <div className={styles.tooltipWrapper}>
            <StatButton
              icon={<IconFont name="diamond" size={18} color="#ff68e3" />}
              value={props.gems ?? 0}
              background="transparent"
              className={styles.statBtnDiamond}
              aria-label={`Total points: ${props.gems ?? 0}`}
            />
            <span className={styles.tooltip}>Total Points</span>
          </div>

          <span className={styles.divider} aria-hidden="true" />

          <div className={styles.navIcons}>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Vocabulary"
              onClick={props.onVocabularyClick}
            >
              <IconFont name="book-colored" />
              <span className={styles.tooltip}>Vocabulary</span>
            </button>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Recall"
              onClick={props.onRecallClick}
            >
              <IconFont name="brain" />
              <span className={styles.tooltip}>Recall</span>
            </button>
            <button className={styles.navBtn} aria-label="Progress">
              <IconFont name="increase" />
              <span className={styles.tooltip}>Progress</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.center}>
          <button className={styles.navBtn} aria-label="Games">
            <IconFont name="joystick" />
          </button>
          <button className={styles.navBtn} aria-label="Info">
            <IconFont name="info" />
          </button>
        </div>
      )}

      <div className={styles.right}>
        {isAuthenticated ? (
          <div className={styles.avatarWrapper} ref={menuRef}>
            <Avatar
              src={props.avatarSrc}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
            />
            {menuOpen && (
              <div className={styles.dropdownMenu} role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setMenuOpen(false)
                    props.onProfileClick?.()
                  }}
                >
                  <IconFont name="user" size={16} />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  onClick={() => {
                    setMenuOpen(false)
                    props.onLogout()
                  }}
                >
                  <IconFont name="exit" size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="gradient"
            size="md"
            className={styles.loginBtn}
            onClick={props.onLoginClick}
          >
            Login
          </Button>
        )}
      </div>
    </header>
  )
}
