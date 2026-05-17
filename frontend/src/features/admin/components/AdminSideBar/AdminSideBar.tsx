import styles from './AdminSideBar.module.scss'
import { NavLink } from 'react-router-dom'
import { AdminPanelNavLinks } from './AdminNavLinks'
import type { AdminPanelNavLink } from './AdminNavLinks'

export const AdminSideBar = () => {
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
    </div>
  )
}
