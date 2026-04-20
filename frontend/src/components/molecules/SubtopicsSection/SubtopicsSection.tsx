import { useId, useMemo } from 'react'
import { SubtopicCard } from '@/components/molecules/SubtopicCard'
import type { SubtopicCardData } from '@/components/molecules/SubtopicCard/types/types'
import type { SubtopicsSectionProps } from './types/types'
import styles from './SubtopicsSection.module.scss'

export function SubtopicsSection({
  topicTitle,
  topicDescription,
  subtopics,
  isLoading = false,
  error = null,
}: SubtopicsSectionProps) {
  const sectionId = useId()

  const cards: SubtopicCardData[] = useMemo(
    () =>
      subtopics.map((s) => ({
        id: s.id,
        title: s.name,
        imageUrl: s.image_url,
        description: s.description,
        wordCount: s.words_count,
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
          Загружаем сабтопики...
        </p>
      )}

      {!isLoading && error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && subtopics.length === 0 && (
        <p className={styles.feedback} role="status" aria-live="polite">
          Сабтопики пока отсутствуют.
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
