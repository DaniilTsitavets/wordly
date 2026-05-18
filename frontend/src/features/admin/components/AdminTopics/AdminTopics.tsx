import { useState } from 'react'
import styles from './AdminTopics.module.scss'
import { AdminTopicsTable } from '@/features/admin/components/AdminTopicsTable'
import { AdminTopicForm } from '@/features/admin/components/AdminTopicForm'
import { Button } from '@/components/atoms/Button'
import type { TopicRow } from '@/features/admin/components/AdminTopicsTable/AdminTopicsTable'
const handleEditTopic = (topic: TopicRow) => {
  console.log('Edit topic:', topic)
}

const handleDeleteTopic = (topic: TopicRow) => {
  console.log('Delete topic:', topic)
}

export const AdminTopics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Topics</h2>
        <Button variant="admin" size="sm" onClick={() => setIsFormOpen(true)}>
          + Add New Topic
        </Button>
      </div>

      {isFormOpen && (
        <AdminTopicForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => console.log('Topic created')}
        />
      )}

      <AdminTopicsTable onDelete={handleDeleteTopic} onEdit={handleEditTopic} />
    </section>
  )
}
