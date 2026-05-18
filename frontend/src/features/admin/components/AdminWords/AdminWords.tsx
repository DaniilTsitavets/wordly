import styles from './AdminWords.module.scss'
import { AdminWordsTable } from '@/features/admin/components/AdminWordsTable'
import { Button } from '@/components/atoms/Button'
import type { WordRow } from '@/features/admin/components/AdminWordsTable/AdminWordsTable'

const handleEditWord = (word: WordRow) => {
  console.log('Edit word:', word)
}

const handleDeleteWord = (word: WordRow) => {
  console.log('Delete word:', word)
}

export const AdminWords = () => {
  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Words</h2>
        <Button variant="admin" size="sm">
          Add Word +
        </Button>
      </div>

      <AdminWordsTable onDelete={handleDeleteWord} onEdit={handleEditWord} />
    </section>
  )
}
