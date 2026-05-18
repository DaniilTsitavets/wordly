import styles from './AdminSubtopics.module.scss'
import { AdminSubtopicsTable } from '@/features/admin/components/AdminSubtopicsTable'
import { Button } from '@/components/atoms/Button'
import type { SubtopicRow } from '@/features/admin/components/AdminSubtopicsTable/AdminSubtopicsTable'

const handleEditSubtopic = (subtopic: SubtopicRow) => {
  console.log('Edit subtopic:', subtopic)
}

const handleDeleteSubtopic = (subtopic: SubtopicRow) => {
  console.log('Delete subtopic:', subtopic)
}

export const AdminSubtopics = () => {
  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Subtopics</h2>
        <Button variant="admin" size="sm">
          Add Subtopic +
        </Button>
      </div>

      <AdminSubtopicsTable onDelete={handleDeleteSubtopic} onEdit={handleEditSubtopic} />
    </section>
  )
}
