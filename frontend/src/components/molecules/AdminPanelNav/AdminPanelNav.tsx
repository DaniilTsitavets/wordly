import styles from './AdminPanel.module.scss'
import { NavLink } from 'react-router-dom'
import { AdminPanelNavLinks } from './AdminNavLinks'
import type { AdminPanelNavLink } from './AdminNavLinks'

export const AdminPanelNav = () => {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <ul>
          {AdminPanelNavLinks.map((link: AdminPanelNavLink) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
