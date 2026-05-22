import { useState, useEffect, useCallback } from 'react'
import styles from './AdminWords.module.scss'
import { AdminWordsTable } from '@/features/admin/components/AdminWordsTable'
import { AdminWordForm } from '@/features/admin/components/AdminWordForm'
import { Button } from '@/components/atoms/Button'
import { getAdminTopics, getAdminSubtopics, getAdminWords, deleteAdminWord } from '@/api/admin'
import type { AdminTopic, AdminSubtopic } from '@/api/admin'
import type { WordRow } from '@/features/admin/components/AdminWordsTable/AdminWordsTable'

export const AdminWords = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [subtopics, setSubtopics] = useState<AdminSubtopic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<number | null>(null)
  const [words, setWords] = useState<WordRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getAdminTopics()
      .then((data) => {
        setTopics(data)
        if (data.length > 0) setSelectedTopicId(data[0].id)
      })
      .catch((err) => console.error('Failed to load topics:', err))
  }, [])

  useEffect(() => {
    if (selectedTopicId) {
      setSelectedSubtopicId(null)
      getAdminSubtopics(selectedTopicId)
        .then((data) => {
          setSubtopics(data)
          if (data.length > 0) setSelectedSubtopicId(data[0].id)
        })
        .catch((err) => console.error('Failed to load subtopics:', err))
    } else {
      setSubtopics([])
      setSelectedSubtopicId(null)
    }
  }, [selectedTopicId])

  const fetchWords = useCallback(async () => {
    if (!selectedSubtopicId) {
      setWords([])
      return
    }
    setIsLoading(true)
    try {
      const data = await getAdminWords(selectedSubtopicId)
      const topicName = topics.find((t) => t.id === selectedTopicId)?.name ?? ''
      setWords(
        data.map((w) => ({
          id: w.id,
          image: w.image_url ?? '',
          english: w.word_en,
          russian: w.translation_ru,
          topic: topicName,
          interval: '',
        }))
      )
    } catch (err) {
      console.error('Failed to load words:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedSubtopicId, selectedTopicId, topics])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const handleEditWord = (word: WordRow) => {
    console.log('Edit word:', word)
  }

  const handleDeleteWord = async (word: WordRow) => {
    if (!confirm(`Delete word "${word.english}"?`)) return
    try {
      await deleteAdminWord(word.id)
      fetchWords()
    } catch (err) {
      console.error('Failed to delete word:', err)
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Words</h2>
        <Button variant="admin" size="sm" onClick={() => setIsFormOpen(true)}>
          + Add New Word
        </Button>
      </div>

      <div className={styles.filter}>
        <div className={styles.filter__group}>
          <label htmlFor="words-topic-filter" className={styles.filter__label}>
            Topic:
          </label>
          <select
            id="words-topic-filter"
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

        <div className={styles.filter__group}>
          <label htmlFor="words-subtopic-filter" className={styles.filter__label}>
            Subtopic:
          </label>
          <select
            id="words-subtopic-filter"
            className={styles.filter__select}
            value={selectedSubtopicId ?? ''}
            onChange={(e) => setSelectedSubtopicId(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedTopicId}
          >
            <option value="" disabled>
              Select subtopic
            </option>
            {subtopics.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFormOpen && <AdminWordForm onClose={() => setIsFormOpen(false)} onSuccess={fetchWords} />}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AdminWordsTable words={words} onDelete={handleDeleteWord} onEdit={handleEditWord} />
      )}
    </section>
  )
}
