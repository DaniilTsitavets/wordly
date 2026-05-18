import { useState } from 'react'
import styles from './AdminWords.module.scss'
import { AdminWordsTable } from '@/features/admin/components/AdminWordsTable'
import { AdminWordForm } from '@/features/admin/components/AdminWordForm'
import { Button } from '@/components/atoms/Button'
import type { WordRow } from '@/features/admin/components/AdminWordsTable/AdminWordsTable'

const handleEditWord = (word: WordRow) => {
  console.log('Edit word:', word)
}

const handleDeleteWord = (word: WordRow) => {
  console.log('Delete word:', word)
}

export const AdminWords = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Words</h2>
        <Button variant="admin" size="sm" onClick={() => setIsFormOpen(true)}>
          + Add New Word
        </Button>
      </div>

      {isFormOpen && (
        <AdminWordForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => console.log('Word created')}
        />
      )}

      <AdminWordsTable onDelete={handleDeleteWord} onEdit={handleEditWord} />
    </section>
  )
}
