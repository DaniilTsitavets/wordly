import { useState, useEffect, useCallback } from 'react'
import styles from './AdminWords.module.scss'
import { AdminWordsTable } from '@/features/admin/components/AdminWordsTable'
import { AdminWordForm } from '@/features/admin/components/AdminWordForm'
import { DeleteConfirmModal } from '@/features/admin/components/DeleteConfirmModal'
import { Button } from '@/components/atoms/Button'
import {
  getAdminTopics,
  getAdminSubtopics,
  getAdminWords,
  deleteAdminWord,
  type AdminTopic,
  type AdminSubtopic,
  type AdminWord,
} from '@/api/admin'
import type { WordRow } from '@/features/admin/components/AdminWordsTable/AdminWordsTable'

export const AdminWords = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [subtopics, setSubtopics] = useState<AdminSubtopic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<number | null>(null)
  const [words, setWords] = useState<WordRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedWord, setSelectedWord] = useState<AdminWord | undefined>()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [wordToDelete, setWordToDelete] = useState<WordRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    setWords([])
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
      setWords([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedSubtopicId, selectedTopicId, topics])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const handleEditWord = (word: WordRow) => {
    const fullWord = words.find((w) => w.id === word.id)
    if (fullWord && selectedSubtopicId) {
      // For now, we'll create an AdminWord object from the WordRow data
      // In a real scenario, we might need to fetch the full word details
      const adminWord: AdminWord = {
        id: fullWord.id,
        subtopic_id: selectedSubtopicId,
        word_en: fullWord.english,
        translation_ru: fullWord.russian,
        transcription_en: null,
        image_url: fullWord.image || null,
        usage_example_en: null,
        usage_example_en_translation_ru: null,
        mnemonic_image_url: null,
        mnemo_text: null,
      }
      setSelectedWord(adminWord)
      setIsFormOpen(true)
    }
  }

  const handleDeleteWord = (word: WordRow) => {
    setWordToDelete(word)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteWord = async () => {
    if (!wordToDelete) return
    setIsDeleting(true)
    try {
      await deleteAdminWord(wordToDelete.id)
      setIsDeleteModalOpen(false)
      setWordToDelete(null)
      fetchWords()
    } catch (err) {
      console.error('Failed to delete word:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedWord(undefined)
  }

  return (
    <section className={styles.container}>
      <div className={styles.container__header}>
        <h2 className={styles.container__title}>Manage Words</h2>
        <Button
          variant="admin"
          size="sm"
          onClick={() => {
            setSelectedWord(undefined)
            setIsFormOpen(true)
          }}
        >
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

      {isFormOpen && (
        <AdminWordForm
          onClose={handleCloseForm}
          onSuccess={fetchWords}
          word={selectedWord}
          initialTopicId={selectedTopicId}
          initialSubtopicId={selectedWord ? undefined : selectedSubtopicId}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemName={wordToDelete?.english || ''}
        onConfirm={confirmDeleteWord}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setWordToDelete(null)
        }}
        isLoading={isDeleting}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AdminWordsTable words={words} onDelete={handleDeleteWord} onEdit={handleEditWord} />
      )}
    </section>
  )
}
