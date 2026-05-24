import { useState, useEffect, useCallback } from 'react'
import styles from './AdminSubtopics.module.scss'
import { AdminSubtopicsTable } from '@/features/admin/components/AdminSubtopicsTable'
import { AdminSubtopicForm } from '@/features/admin/components/AdminSubtopicForm'
import { Button } from '@/components/atoms/Button'
import { getAdminTopics, getAdminSubtopics, deleteAdminSubtopic } from '@/api/admin'
import type { AdminTopic } from '@/api/admin'
import type { SubtopicRow } from '@/features/admin/components/AdminSubtopicsTable/AdminSubtopicsTable'

export const AdminSubtopics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [subtopics, setSubtopics] = useState<SubtopicRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
    console.log('Edit subtopic:', subtopic)
  }

  const handleDeleteSubtopic = async (subtopic: SubtopicRow) => {
    if (!confirm(`Delete subtopic "${subtopic.name}"?`)) return
    try {
      await deleteAdminSubtopic(subtopic.id)
      fetchSubtopics()
    } catch (err) {
      console.error('Failed to delete subtopic:', err)
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Subtopics</h2>
        <Button variant="admin" size="sm" onClick={() => setIsFormOpen(true)}>
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
        <AdminSubtopicForm onClose={() => setIsFormOpen(false)} onSuccess={fetchSubtopics} />
      )}

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
