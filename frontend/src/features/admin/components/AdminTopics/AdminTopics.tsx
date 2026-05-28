import { useState, useEffect, useCallback } from 'react'
import styles from './AdminTopics.module.scss'
import { AdminTopicsTable } from '@/features/admin/components/AdminTopicsTable'
import { AdminTopicForm } from '@/features/admin/components/AdminTopicForm'
import { DeleteConfirmModal } from '@/features/admin/components/DeleteConfirmModal'
import { Button } from '@/components/atoms/Button'
import { getAdminTopics, deleteAdminTopic, type AdminTopic } from '@/api/admin'
import type { TopicRow } from '@/features/admin/components/AdminTopicsTable/AdminTopicsTable'

export const AdminTopics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<AdminTopic | undefined>()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<TopicRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    const fullTopic = topics.find((t) => t.id === topic.id)
    if (fullTopic) {
      const adminTopic: AdminTopic = {
        id: fullTopic.id,
        name: fullTopic.name,
        description: fullTopic.description || null,
        image_url: fullTopic.icon || null,
        sort_order: null,
        subtopics_count: fullTopic.wordsCount,
      }
      setSelectedTopic(adminTopic)
      setIsFormOpen(true)
    }
  }

  const handleDeleteTopic = (topic: TopicRow) => {
    setTopicToDelete(topic)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteTopic = async () => {
    if (!topicToDelete) return
    setIsDeleting(true)
    try {
      await deleteAdminTopic(topicToDelete.id)
      setIsDeleteModalOpen(false)
      setTopicToDelete(null)
      fetchTopics()
    } catch (err) {
      console.error('Failed to delete topic:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedTopic(undefined)
  }

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Topics</h2>
        <Button
          variant="admin"
          size="sm"
          onClick={() => {
            setSelectedTopic(undefined)
            setIsFormOpen(true)
          }}
        >
          + Add New Topic
        </Button>
      </div>

      {isFormOpen && (
        <AdminTopicForm onClose={handleCloseForm} onSuccess={fetchTopics} topic={selectedTopic} />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemName={topicToDelete?.name || ''}
        onConfirm={confirmDeleteTopic}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setTopicToDelete(null)
        }}
        isLoading={isDeleting}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AdminTopicsTable topics={topics} onDelete={handleDeleteTopic} onEdit={handleEditTopic} />
      )}
    </section>
  )
}
