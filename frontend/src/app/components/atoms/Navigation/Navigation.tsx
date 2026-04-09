import styles from './Navigation.module.scss'
import { Link } from 'react-router-dom'
import { IconFont } from '../IconFont'

export const Navigation = () => {
  return (
    <nav className={styles.navigation}>
      <Link to={'/'} className={styles.link}>
        <IconFont name="home" />
      </Link>
    </nav>
  )
}
