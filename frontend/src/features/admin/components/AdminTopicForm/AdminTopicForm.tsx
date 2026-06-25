import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { createAdminTopic, updateAdminTopic, type AdminTopic } from '@/api/admin'
import { validateTopicForm, hasErrors } from '@/features/admin/utils/formValidation'
import styles from './AdminTopicForm.module.scss'

interface AdminTopicFormProps {
  onClose: () => void
  onSuccess?: () => void
  topic?: AdminTopic
}

export const AdminTopicForm = ({ onClose, onSuccess, topic }: AdminTopicFormProps) => {
  const [name, setName] = useState(topic?.name || '')
  const [description, setDescription] = useState(topic?.description || '')
  const [emoji, setEmoji] = useState(topic?.image_url || '')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 100)
  }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setEmoji('')
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateTopicForm({ name })
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: emoji || undefined,
      }

      if (topic) {
        await updateAdminTopic(topic.id, payload)
      } else {
        await createAdminTopic(payload)
      }
      resetForm()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save topic:', error)
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
        <h3 className={styles.title}>{topic ? 'Edit Topic' : 'New Topic'}</h3>

        <div className={styles.fieldGroup}>
          <label htmlFor="topic-name" className={styles.label}>
            Topic Name
          </label>
          <input
            ref={nameRef}
            id="topic-name"
            type="text"
            className={`${styles.input} ${errors.name ? styles.error : ''}`}
            placeholder="e.g., Food & Drinks"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'topic-name-error' : undefined}
          />
          {errors.name && (
            <span id="topic-name-error" className={styles.errorText} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="topic-description" className={styles.label}>
            Description
          </label>
          <textarea
            id="topic-description"
            className={styles.textarea}
            placeholder="Brief description of the topic"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="topic-emoji" className={styles.label}>
            Emoji Icon / Image
          </label>
          <input
            id="topic-emoji"
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
            {topic ? 'Update Topic' : 'Create Topic'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
