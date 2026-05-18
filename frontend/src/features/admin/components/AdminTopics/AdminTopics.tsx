import styles from './AdminTopics.module.scss'
import { AdminTopicsTable } from '@/features/admin/components/AdminTopicsTable'
import { Button } from '@/components/atoms/Button'
import type { TopicRow } from '@/features/admin/components/AdminTopicsTable/AdminTopicsTable'
const handleEditTopic = (topic: TopicRow) => {
  // Implement edit logic here
  console.log('Edit topic:', topic)
}

const handleDeleteTopic = (topic: TopicRow) => {
  // Implement delete logic here
  console.log('Delete topic:', topic)
}

export const AdminTopics = () => {
  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Topics</h2>
        <Button variant="admin" size="sm">
          Add Topic +
        </Button>
      </div>

      <AdminTopicsTable onDelete={handleDeleteTopic} onEdit={handleEditTopic} />
    </section>
  )
}
