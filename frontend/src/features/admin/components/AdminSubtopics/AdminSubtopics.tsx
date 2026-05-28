import { useState, useEffect, useCallback } from 'react'
import styles from './AdminSubtopics.module.scss'
import { AdminSubtopicsTable } from '@/features/admin/components/AdminSubtopicsTable'
import { AdminSubtopicForm } from '@/features/admin/components/AdminSubtopicForm'
import { DeleteConfirmModal } from '@/features/admin/components/DeleteConfirmModal'
import { Button } from '@/components/atoms/Button'
import {
  getAdminTopics,
  getAdminSubtopics,
  deleteAdminSubtopic,
  type AdminTopic,
  type AdminSubtopic,
} from '@/api/admin'
import type { SubtopicRow } from '@/features/admin/components/AdminSubtopicsTable/AdminSubtopicsTable'

export const AdminSubtopics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [subtopics, setSubtopics] = useState<SubtopicRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState<AdminSubtopic | undefined>()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [subtopicToDelete, setSubtopicToDelete] = useState<SubtopicRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getAdminTopics()
      .then((data) => {
        setTopics(data)
        if (data.length > 0) setSelectedTopicId(data[0].id)
      })
      .catch((err) => console.error('Failed to load topics:', err))
  }, [])

  const fetchSubtopics = useCallback(async () => {
    if (!selectedTopicId) {
      setSubtopics([])
      return
    }
    setIsLoading(true)
    try {
      const data = await getAdminSubtopics(selectedTopicId)
      setSubtopics(
        data.map((st) => ({
          id: st.id,
          icon: st.image_url ?? '',
          name: st.name,
          description: st.description ?? '',
          wordsCount: st.words_count,
        }))
      )
    } catch (err) {
      console.error('Failed to load subtopics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTopicId])

  useEffect(() => {
    fetchSubtopics()
  }, [fetchSubtopics])

  const handleEditSubtopic = (subtopic: SubtopicRow) => {
    const allSubtopics = subtopics
    const fullSubtopic = allSubtopics.find((s) => s.id === subtopic.id)
    if (fullSubtopic) {
      const adminSubtopic: AdminSubtopic = {
        id: fullSubtopic.id,
        topic_id: selectedTopicId!,
        name: fullSubtopic.name,
        description: fullSubtopic.description || null,
        image_url: fullSubtopic.icon || null,
        sort_order: null,
        words_count: fullSubtopic.wordsCount,
        disabled_mechanics: [],
      }
      setSelectedSubtopic(adminSubtopic)
      setIsFormOpen(true)
    }
  }

  const handleDeleteSubtopic = (subtopic: SubtopicRow) => {
    setSubtopicToDelete(subtopic)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteSubtopic = async () => {
    if (!subtopicToDelete) return
    setIsDeleting(true)
    try {
      await deleteAdminSubtopic(subtopicToDelete.id)
      setIsDeleteModalOpen(false)
      setSubtopicToDelete(null)
      fetchSubtopics()
    } catch (err) {
      console.error('Failed to delete subtopic:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedSubtopic(undefined)
  }

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Subtopics</h2>
        <Button
          variant="admin"
          size="sm"
          onClick={() => {
            setSelectedSubtopic(undefined)
            setIsFormOpen(true)
          }}
        >
          + Add New Subtopic
        </Button>
      </div>

      <div className={styles.filter}>
        <label htmlFor="subtopic-topic-filter" className={styles.filter__label}>
          Topic:
        </label>
        <select
          id="subtopic-topic-filter"
          className={styles.filter__select}
          value={selectedTopicId ?? ''}
          onChange={(e) => setSelectedTopicId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="" disabled>
            Select topic
          </option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {isFormOpen && (
        <AdminSubtopicForm
          onClose={handleCloseForm}
          onSuccess={fetchSubtopics}
          subtopic={selectedSubtopic}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemName={subtopicToDelete?.name || ''}
        onConfirm={confirmDeleteSubtopic}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setSubtopicToDelete(null)
        }}
        isLoading={isDeleting}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AdminSubtopicsTable
          subtopics={subtopics}
          onDelete={handleDeleteSubtopic}
          onEdit={handleEditSubtopic}
        />
      )}
    </section>
  )
}
