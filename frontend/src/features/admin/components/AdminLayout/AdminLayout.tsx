import { Outlet } from 'react-router-dom'
import styles from './AdminLayout.module.scss'
import { AdminSideBar } from '@/features/admin/components/AdminSideBar/AdminSideBar'

export const AdminLayout = () => {
  return (
    <section className={styles.container}>
      <AdminSideBar />
      <main className={styles.admin__content}>
        <Outlet />
      </main>
    </section>
  )
}
