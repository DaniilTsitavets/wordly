import { Outlet } from 'react-router-dom'
import styles from './AdminPage.module.scss'
import { AdminSideBar } from '@/features/admin/components/AdminSideBar/AdminSideBar'

export const AdminPage = () => {
  return (
    <section className={styles.container}>
      <div className={styles.admin_panel}>
        <div className={styles.title}>
          <p className={styles.title__panel}>Admin Panel</p>
          <p className={styles.title__subtitle}>Manage your content</p>
        </div>
        <AdminSideBar />
      </div>

      <main className={styles.admin__content}>
        <Outlet />
    </main>
    </section>
  )
}
