import { useState } from 'react'
import styles from './AdminSubtopics.module.scss'
import { AdminSubtopicsTable } from '@/features/admin/components/AdminSubtopicsTable'
import { AdminSubtopicForm } from '@/features/admin/components/AdminSubtopicForm'
import { Button } from '@/components/atoms/Button'
import type { SubtopicRow } from '@/features/admin/components/AdminSubtopicsTable/AdminSubtopicsTable'

const handleEditSubtopic = (subtopic: SubtopicRow) => {
  console.log('Edit subtopic:', subtopic)
}

const handleDeleteSubtopic = (subtopic: SubtopicRow) => {
  console.log('Delete subtopic:', subtopic)
}

export const AdminSubtopics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Subtopics</h2>
        <Button variant="admin" size="sm" onClick={() => setIsFormOpen(true)}>
          + Add New Subtopic
        </Button>
      </div>

      {isFormOpen && (
        <AdminSubtopicForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => console.log('Subtopic created')}
        />
      )}

      <AdminSubtopicsTable onDelete={handleDeleteSubtopic} onEdit={handleEditSubtopic} />
    </section>
  )
}
