import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import {
  getAdminTopics,
  createAdminSubtopic,
  updateAdminSubtopic,
  type AdminTopic,
  type AdminSubtopic,
} from '@/api/admin'
import { validateSubtopicForm, hasErrors } from '@/features/admin/utils/formValidation'
import styles from './AdminSubtopicForm.module.scss'

interface AdminSubtopicFormProps {
  onClose: () => void
  onSuccess?: () => void
  subtopic?: AdminSubtopic
}

export const AdminSubtopicForm = ({ onClose, onSuccess, subtopic }: AdminSubtopicFormProps) => {
  const [name, setName] = useState(subtopic?.name || '')
  const [description, setDescription] = useState(subtopic?.description || '')
  const [topicId, setTopicId] = useState<number | null>(subtopic?.topic_id || null)
  const [emoji, setEmoji] = useState(subtopic?.image_url || '')
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAdminTopics()
      .then(setTopics)
      .catch((err) => console.error('Failed to load topics:', err))
    setTimeout(() => nameRef.current?.focus(), 100)
  }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setTopicId(null)
    setEmoji('')
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateSubtopicForm({ name, topic_id: topicId })
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        topic_id: topicId!,
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: emoji || undefined,
      }

      if (subtopic) {
        await updateAdminSubtopic(subtopic.id, payload)
      } else {
        await createAdminSubtopic(payload)
      }
      resetForm()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save subtopic:', error)
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
        <h3 className={styles.title}>{subtopic ? 'Edit Subtopic' : 'New Subtopic'}</h3>

        <div className={styles.fieldGroup}>
          <label htmlFor="subtopic-name" className={styles.label}>
            Subtopic Name
          </label>
          <input
            ref={nameRef}
            id="subtopic-name"
            type="text"
            className={`${styles.input} ${errors.name ? styles.error : ''}`}
            placeholder="e.g., Food"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'subtopic-name-error' : undefined}
          />
          {errors.name && (
            <span id="subtopic-name-error" className={styles.errorText} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="subtopic-description" className={styles.label}>
            Description
          </label>
          <textarea
            id="subtopic-description"
            className={styles.textarea}
            placeholder="Brief description of the subtopic"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="subtopic-topic" className={styles.label}>
            Topic Reference
          </label>
          <select
            id="subtopic-topic"
            className={`${styles.select} ${errors.topic_id ? styles.error : ''} ${!topicId ? styles.placeholder : ''}`}
            value={topicId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null
              setTopicId(val)
              if (errors.topic_id) setErrors((prev) => ({ ...prev, topic_id: '' }))
            }}
            aria-invalid={!!errors.topic_id}
            aria-describedby={errors.topic_id ? 'subtopic-topic-error' : undefined}
          >
            <option value="" disabled>
              e.g., Food &amp; Drinks
            </option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          {errors.topic_id && (
            <span id="subtopic-topic-error" className={styles.errorText} role="alert">
              {errors.topic_id}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="subtopic-emoji" className={styles.label}>
            Emoji Icon
          </label>
          <input
            id="subtopic-emoji"
            type="text"
            className={styles.input}
            placeholder="e.g., 🍎"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={2}
          />
        </div>

        <div className={styles.buttons}>
          <Button type="submit" variant="gradient" size="sm" isLoading={isLoading}>
            {subtopic ? 'Update Subtopic' : 'Create Subtopic'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
