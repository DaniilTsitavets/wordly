import styles from './NavLinks.module.scss'
import { Link } from 'react-router-dom'
import { IconFont } from '@/components/atoms/IconFont'

interface AuthenticatedNavProps {
  stats?: {
    fire: number
    gems: number
  }
}

export const AuthenticatedNav = ({ stats = { fire: 0, gems: 0 } }: AuthenticatedNavProps) => {
  const navLinks = [
    { name: 'Vocabulary', path: '/', icon: 'book-colored', iconType: 'book' },
    { name: 'Recall', path: '/', icon: 'brain', iconType: 'brain' },
    { name: 'Progress', path: '/', icon: 'increase', iconType: 'progress' },
  ]

  return (
    <nav>
      <ul>
        <li>
          <button className={`${styles.statButton} ${styles.fire}`}>
            <IconFont name="fire" size={20} />
            <span className={styles.tooltip}>{stats.fire}</span>
          </button>
        </li>

        <li>
          <button className={`${styles.statButton} ${styles.diamond}`}>
            <IconFont name="diamond" size={20} />
            <span className={styles.tooltip}>{stats.gems}</span>
          </button>
        </li>

        {navLinks.map((link) => (
          <li key={link.name}>
            <Link
              to={link.path}
              className={`${styles.link} ${styles[link.iconType]}`}
              data-label={link.name}
            >
              <IconFont name={link.icon} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
