import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { getAdminTopics, getAdminSubtopics, createAdminWord } from '@/api/admin'
import type { AdminTopic, AdminSubtopic } from '@/api/admin'
import { validateWordForm, hasErrors } from '@/features/admin/utils/formValidation'
import styles from './AdminWordForm.module.scss'

interface AdminWordFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export const AdminWordForm = ({ onClose, onSuccess }: AdminWordFormProps) => {
  const [wordEn, setWordEn] = useState('')
  const [translationRu, setTranslationRu] = useState('')
  const [transcription, setTranscription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [topicId, setTopicId] = useState<number | null>(null)
  const [subtopicId, setSubtopicId] = useState<number | null>(null)
  const [mnemoText, setMnemoText] = useState('')
  const [isMnemonic, setIsMnemonic] = useState<boolean>(false)

  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [subtopics, setSubtopics] = useState<AdminSubtopic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const wordEnRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAdminTopics()
      .then(setTopics)
      .catch((err) => console.error('Failed to load topics:', err))
    setTimeout(() => wordEnRef.current?.focus(), 100)
  }, [])

  useEffect(() => {
    if (topicId) {
      setSubtopicId(null)
      getAdminSubtopics(topicId)
        .then(setSubtopics)
        .catch((err) => console.error('Failed to load subtopics:', err))
    } else {
      setSubtopics([])
      setSubtopicId(null)
    }
  }, [topicId])

  const resetForm = () => {
    setWordEn('')
    setTranslationRu('')
    setTranscription('')
    setImageUrl('')
    setTopicId(null)
    setSubtopicId(null)
    setMnemoText('')
    setIsMnemonic(false)
    setSubtopics([])
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateWordForm({
      word_en: wordEn,
      translation_ru: translationRu,
      topic_id: topicId,
      subtopic_id: subtopicId,
    })
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      await createAdminWord({
        subtopic_id: subtopicId!,
        word_en: wordEn.trim(),
        translation_ru: translationRu.trim(),
        transcription_en: transcription.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        mnemo_text: isMnemonic && mnemoText.trim() ? mnemoText.trim() : null,
        mnemonic_image_url: null,
      })
      resetForm()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create word:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  return (
    <div className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h3 className={styles.title}>New Word</h3>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="word-english" className={styles.label}>
              English
            </label>
            <input
              ref={wordEnRef}
              id="word-english"
              type="text"
              className={`${styles.input} ${errors.word_en ? styles.error : ''}`}
              placeholder="e.g., Apple"
              value={wordEn}
              onChange={(e) => {
                setWordEn(e.target.value)
                if (errors.word_en) setErrors((prev) => ({ ...prev, word_en: '' }))
              }}
              aria-invalid={!!errors.word_en}
              aria-describedby={errors.word_en ? 'word-english-error' : undefined}
            />
            {errors.word_en && (
              <span id="word-english-error" className={styles.errorText} role="alert">
                {errors.word_en}
              </span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="word-russian" className={styles.label}>
              Russian
            </label>
            <input
              id="word-russian"
              type="text"
              className={`${styles.input} ${errors.translation_ru ? styles.error : ''}`}
              placeholder="e.g., Apple"
              value={translationRu}
              onChange={(e) => {
                setTranslationRu(e.target.value)
                if (errors.translation_ru) setErrors((prev) => ({ ...prev, translation_ru: '' }))
              }}
              aria-invalid={!!errors.translation_ru}
              aria-describedby={errors.translation_ru ? 'word-russian-error' : undefined}
            />
            {errors.translation_ru && (
              <span id="word-russian-error" className={styles.errorText} role="alert">
                {errors.translation_ru}
              </span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="word-transcription" className={styles.label}>
              Transcription
            </label>
            <input
              id="word-transcription"
              type="text"
              className={styles.input}
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="word-image" className={styles.label}>
              Image
            </label>
            <input
              id="word-image"
              type="text"
              className={styles.input}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="word-topic" className={styles.label}>
              Topic
            </label>
            <select
              id="word-topic"
              className={`${styles.select} ${errors.topic_id ? styles.error : ''} ${!topicId ? styles.placeholder : ''}`}
              value={topicId ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null
                setTopicId(val)
                if (errors.topic_id) setErrors((prev) => ({ ...prev, topic_id: '' }))
              }}
              aria-invalid={!!errors.topic_id}
              aria-describedby={errors.topic_id ? 'word-topic-error' : undefined}
            >
              <option value="" disabled hidden />
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {errors.topic_id && (
              <span id="word-topic-error" className={styles.errorText} role="alert">
                {errors.topic_id}
              </span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="word-subtopic" className={styles.label}>
              Suptopic
            </label>
            <select
              id="word-subtopic"
              className={`${styles.select} ${errors.subtopic_id ? styles.error : ''} ${!subtopicId ? styles.placeholder : ''}`}
              value={subtopicId ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null
                setSubtopicId(val)
                if (errors.subtopic_id) setErrors((prev) => ({ ...prev, subtopic_id: '' }))
              }}
              disabled={!topicId}
              aria-invalid={!!errors.subtopic_id}
              aria-describedby={errors.subtopic_id ? 'word-subtopic-error' : undefined}
            >
              <option value="" disabled hidden />
              {subtopics.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
            {errors.subtopic_id && (
              <span id="word-subtopic-error" className={styles.errorText} role="alert">
                {errors.subtopic_id}
              </span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="word-mnemo" className={styles.label}>
              Mnemo Text
            </label>
            <input
              id="word-mnemo"
              type="text"
              className={styles.input}
              value={mnemoText}
              onChange={(e) => setMnemoText(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="word-is-mnemonic" className={styles.label}>
              Is mnemonic?
            </label>
            <select
              id="word-is-mnemonic"
              className={styles.select}
              value={isMnemonic ? 'yes' : 'no'}
              onChange={(e) => setIsMnemonic(e.target.value === 'yes')}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        <div className={styles.buttons}>
          <Button type="submit" variant="gradient" size="sm" isLoading={isLoading}>
            Create Word
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
