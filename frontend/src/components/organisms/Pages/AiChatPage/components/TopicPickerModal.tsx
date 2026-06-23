import { useEffect, useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Spinner } from '@/components/atoms/Spinner'
import { IconFont } from '@/components/atoms/IconFont'
import { getTopics, getTopicSubtopicIds, getSubtopicsBatch } from '@/api/topics'
import type { TopicSummary, SubtopicSummary } from '@/api/topics'
import styles from './TopicPickerModal.module.scss'

export interface PickedSubtopic {
  subtopicId: number
  subtopicName: string
  topicName: string
}

interface TopicPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onPick: (picked: PickedSubtopic) => void
}

export function TopicPickerModal({ isOpen, onClose, onPick }: TopicPickerModalProps) {
  const [topics, setTopics] = useState<TopicSummary[] | null>(null)
  const [topicsError, setTopicsError] = useState<string | null>(null)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)

  const [selectedTopic, setSelectedTopic] = useState<TopicSummary | null>(null)
  const [subtopics, setSubtopics] = useState<SubtopicSummary[] | null>(null)
  const [subtopicsError, setSubtopicsError] = useState<string | null>(null)
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setIsLoadingTopics(true)
    setTopicsError(null)
    getTopics()
      .then((data) => {
        if (!cancelled) setTopics(data.topics)
      })
      .catch((err: unknown) => {
        if (!cancelled) setTopicsError(err instanceof Error ? err.message : 'Failed to load topics')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTopics(false)
      })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!selectedTopic) return
    let cancelled = false
    setIsLoadingSubtopics(true)
    setSubtopicsError(null)
    setSubtopics(null)
    ;(async () => {
      try {
        const ids = await getTopicSubtopicIds(selectedTopic.id)
        const data = await getSubtopicsBatch(ids)
        if (!cancelled) setSubtopics(data)
      } catch (err) {
        if (!cancelled)
          setSubtopicsError(err instanceof Error ? err.message : 'Failed to load subtopics')
      } finally {
        if (!cancelled) setIsLoadingSubtopics(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedTopic])

  useEffect(() => {
    if (!isOpen) {
      setSelectedTopic(null)
      setSubtopics(null)
      setSubtopicsError(null)
    }
  }, [isOpen])

  const handlePickSubtopic = (subtopic: SubtopicSummary) => {
    if (!selectedTopic) return
    onPick({
      subtopicId: subtopic.id,
      subtopicName: subtopic.name,
      topicName: selectedTopic.name,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideCloseButton ariaLabel="Choose topic for AI chat">
      <div className={styles.container}>
        <header className={styles.header}>
          {selectedTopic ? (
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setSelectedTopic(null)}
              aria-label="Back to topics"
            >
              <IconFont name="arrow-back" size={18} decorative />
              <span>Topics</span>
            </button>
          ) : (
            <span className={styles.stepLabel}>Step 1 of 2</span>
          )}
          <h2 className={styles.title}>{selectedTopic ? selectedTopic.name : 'Choose a topic'}</h2>
          <p className={styles.subtitle}>
            {selectedTopic
              ? 'Pick a subtopic — the AI will use these words to practice with you'
              : 'The AI will practice the vocabulary from the subtopic you pick'}
          </p>
        </header>

        {!selectedTopic && (
          <Step1Topics
            topics={topics}
            isLoading={isLoadingTopics}
            error={topicsError}
            onSelect={setSelectedTopic}
          />
        )}

        {selectedTopic && (
          <Step2Subtopics
            subtopics={subtopics}
            isLoading={isLoadingSubtopics}
            error={subtopicsError}
            onSelect={handlePickSubtopic}
          />
        )}
      </div>
    </Modal>
  )
}

function Step1Topics({
  topics,
  isLoading,
  error,
  onSelect,
}: {
  topics: TopicSummary[] | null
  isLoading: boolean
  error: string | null
  onSelect: (topic: TopicSummary) => void
}) {
  if (isLoading) {
    return (
      <div className={styles.feedback}>
        <Spinner size="sm" />
      </div>
    )
  }
  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )
  }
  if (!topics || topics.length === 0) {
    return <p className={styles.feedback}>No topics available.</p>
  }

  return (
    <ul className={styles.list}>
      {topics.map((topic) => (
        <li key={topic.id}>
          <button type="button" className={styles.optionButton} onClick={() => onSelect(topic)}>
            <span className={styles.optionTitle}>{topic.name}</span>
            <span className={styles.optionMeta}>{topic.description}</span>
            <span className={styles.optionChevron} aria-hidden="true">
              <IconFont name="arrow-right" size={14} decorative />
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function Step2Subtopics({
  subtopics,
  isLoading,
  error,
  onSelect,
}: {
  subtopics: SubtopicSummary[] | null
  isLoading: boolean
  error: string | null
  onSelect: (subtopic: SubtopicSummary) => void
}) {
  if (isLoading) {
    return (
      <div className={styles.feedback}>
        <Spinner size="sm" />
      </div>
    )
  }
  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )
  }
  if (!subtopics || subtopics.length === 0) {
    return <p className={styles.feedback}>No subtopics available.</p>
  }

  return (
    <ul className={styles.list}>
      {subtopics.map((subtopic) => (
        <li key={subtopic.id}>
          <button type="button" className={styles.optionButton} onClick={() => onSelect(subtopic)}>
            <span className={styles.optionTitle}>{subtopic.name}</span>
            <span className={styles.optionMeta}>
              {subtopic.words_count} {subtopic.words_count === 1 ? 'word' : 'words'}
            </span>
            <span className={styles.optionChevron} aria-hidden="true">
              <IconFont name="arrow-right" size={14} decorative />
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
