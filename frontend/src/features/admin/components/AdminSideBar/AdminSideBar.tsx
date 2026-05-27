import styles from './AdminSideBar.module.scss'
import { NavLink } from 'react-router-dom'
import { AdminPanelNavLinks } from './AdminNavLinks'
import type { AdminPanelNavLink } from './AdminNavLinks'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import { useNavigate } from 'react-router-dom'

export const AdminSideBar = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <p className={styles.title__panel}>Admin Panel</p>
        <p className={styles.title__subtitle}>Manage your content</p>
      </div>
      <nav className={styles.nav__links}>
        <ul className={styles.nav__list}>
          {AdminPanelNavLinks.map((link: AdminPanelNavLink) => (
            <li key={link.path} className={styles.link__container}>
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                {link.icon} {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Button variant="ghost" className={styles.backButton} onClick={() => navigate('/')}>
        <IconFont name="arrow-back2" size={12} />
        Back to Wordly
      </Button>
    </div>
  )
}
