import styles from './LayoutPage.module.scss'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/organisms/Header'

export function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <Outlet />
    </div>
  )
}
