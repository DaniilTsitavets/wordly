import { useId, useMemo } from 'react'
import { SubtopicCard } from '@/components/molecules/SubtopicCard'
import type { SubtopicCardData } from '@/components/molecules/SubtopicCard/types/types'
import { useTopicDetail } from '@/components/molecules/TopicsSection/hooks/useTopicDetail'
import type { TopicSectionProps } from './types/types'
import styles from './TopicSection.module.scss'

export function TopicSection({ topicId, topicTitle, topicDescription }: TopicSectionProps) {
  const { subtopics, isLoading, error } = useTopicDetail(topicId)
  const sectionId = useId()

  const cards: SubtopicCardData[] = useMemo(
    () =>
      (subtopics ?? []).map((subtopic) => ({
        id: subtopic.id,
        title: subtopic.name,
        imageUrl: subtopic.image_url,
        description: subtopic.description,
        wordCount: subtopic.words_count,
      })),
    [subtopics]
  )

  return (
    <section
      className={styles.section}
      aria-labelledby={`topic-title-${sectionId}`}
      aria-describedby={`topic-desc-${sectionId}`}
    >
      <h1 className={styles.title} id={`topic-title-${sectionId}`}>
        {topicTitle}
      </h1>
      <p className={styles.description} id={`topic-desc-${sectionId}`}>
        {topicDescription}
      </p>

      {isLoading && (
        <p className={styles.feedback} role="status" aria-live="polite">
          Loading subtopics...
        </p>
      )}

      {!isLoading && error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && cards.length === 0 && (
        <p className={styles.feedback} role="status" aria-live="polite">
          No subtopics available.
        </p>
      )}

      {!isLoading && !error && cards.length > 0 && (
        <div className={styles.timeline}>
          <span className={styles.line} aria-hidden="true" />
          <ul className={styles.list}>
            {cards.map((subtopic, index) => {
              const alignmentClass = index % 2 === 0 ? styles['item--left'] : styles['item--right']
              const cardPositionLabel = index % 2 === 0 ? 'left' : 'right'

              return (
                <li key={subtopic.id} className={`${styles.item} ${alignmentClass}`}>
                  <span
                    className={`${styles.node} ${styles[`node--${index % 3}`]}`}
                    aria-hidden="true"
                  />

                  <div className={styles.cardWrapper} data-position={cardPositionLabel}>
                    <SubtopicCard {...subtopic} themeIndex={index} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
