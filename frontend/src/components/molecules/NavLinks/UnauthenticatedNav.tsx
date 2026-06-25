import styles from './NavLinks.module.scss'
import { Link } from 'react-router-dom'
import { IconFont } from '@/components/atoms/IconFont'

export const UnauthenticatedNav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/login" className={styles.link} data-label="Login">
            <IconFont name="user-login" />
          </Link>
        </li>
        <li>
          <Link to="/info" className={styles.link} data-label="About Us">
            <IconFont name="info" />
          </Link>
        </li>
      </ul>
    </nav>
  )
}
