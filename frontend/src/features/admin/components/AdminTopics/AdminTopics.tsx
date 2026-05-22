import { useState, useEffect, useCallback } from 'react'
import styles from './AdminTopics.module.scss'
import { AdminTopicsTable } from '@/features/admin/components/AdminTopicsTable'
import { AdminTopicForm } from '@/features/admin/components/AdminTopicForm'
import { Button } from '@/components/atoms/Button'
import { getAdminTopics, deleteAdminTopic } from '@/api/admin'
import type { TopicRow } from '@/features/admin/components/AdminTopicsTable/AdminTopicsTable'

export const AdminTopics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTopics = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAdminTopics()
      setTopics(
        data.map((t) => ({
          id: t.id,
          icon: t.image_url ?? '',
          name: t.name,
          description: t.description ?? '',
          wordsCount: t.subtopics_count,
        }))
      )
    } catch (err) {
      console.error('Failed to load topics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const handleEditTopic = (topic: TopicRow) => {
    console.log('Edit topic:', topic)
  }

  const handleDeleteTopic = async (topic: TopicRow) => {
    if (!confirm(`Delete topic "${topic.name}"?`)) return
    try {
      await deleteAdminTopic(topic.id)
      fetchTopics()
    } catch (err) {
      console.error('Failed to delete topic:', err)
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Topics</h2>
        <Button variant="admin" size="sm" onClick={() => setIsFormOpen(true)}>
          + Add New Topic
        </Button>
      </div>

      {isFormOpen && (
        <AdminTopicForm onClose={() => setIsFormOpen(false)} onSuccess={fetchTopics} />
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AdminTopicsTable topics={topics} onDelete={handleDeleteTopic} onEdit={handleEditTopic} />
      )}
    </section>
  )
}
