import { useEffect, useId, useState } from 'react'
import { getSubtopicsBatch, getTopicSubtopicIds } from '@/api/topics'
import type { SubtopicSummary } from '@/api/topics'
import { HomeSubtopicCard } from '@/components/molecules/HomeSubtopicCard'
import styles from './HomeTopicRow.module.scss'

export type HomeRowLockMode = 'auto' | 'all-locked' | 'first-only'

interface HomeTopicRowProps {
  topicId: number
  topicTitle: string
  topicDescription: string
  /**
   * `auto` — follow subtopic.status from the API.
   * `all-locked` — force every card to locked.
   * `first-only` — only the first subtopic is unlocked, the rest are locked.
   */
  lockMode?: HomeRowLockMode
}

export function HomeTopicRow({
  topicId,
  topicTitle,
  topicDescription,
  lockMode = 'auto',
}: HomeTopicRowProps) {
  const [subtopics, setSubtopics] = useState<SubtopicSummary[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sectionId = useId()

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setIsLoading(true)
        const ids = await getTopicSubtopicIds(topicId)
        const data = await getSubtopicsBatch(ids)
        if (!cancelled) setSubtopics(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load subtopics')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [topicId])

  return (
    <section
      className={styles.section}
      aria-labelledby={`home-topic-${sectionId}`}
      aria-describedby={`home-topic-desc-${sectionId}`}
    >
      <h2 className={styles.title} id={`home-topic-${sectionId}`}>
        {topicTitle}
      </h2>
      <p className={styles.description} id={`home-topic-desc-${sectionId}`}>
        {topicDescription}
      </p>

      {isLoading && (
        <p className={styles.feedback} role="status">
          Loading subtopics…
        </p>
      )}

      {!isLoading && error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && subtopics && subtopics.length > 0 && (
        <ul className={styles.row}>
          {subtopics.map((subtopic, index) => {
            const isLocked =
              lockMode === 'all-locked'
                ? true
                : lockMode === 'first-only'
                  ? index !== 0
                  : subtopic.status === 'locked'
            return (
              <li key={subtopic.id} className={styles.item}>
                <HomeSubtopicCard
                  id={subtopic.id}
                  title={subtopic.name}
                  description={subtopic.description}
                  imageUrl={subtopic.image_url}
                  wordCount={subtopic.words_count}
                  topicTitle={topicTitle}
                  isLocked={isLocked}
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
