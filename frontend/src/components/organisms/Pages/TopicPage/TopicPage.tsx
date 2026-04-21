import { Spinner } from '@/components/atoms/Spinner'
import { TopicSection } from '@/components/molecules/TopicsSection'
import styles from './TopicPage.module.scss'
import { useTopics } from './hooks/useTopics'

export function TopicPage() {
  const { topics, isLoading, error } = useTopics()

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className={styles.centered}>Error: {error}</div>
  }

  if (!topics || topics.length === 0) {
    return <div className={styles.centered}>Темы не найдены</div>
  }

  return (
    <div className={styles.topicPage}>
      {topics.map((topic) => (
        <TopicSection
          key={topic.id}
          topicId={topic.id}
          topicTitle={topic.title}
          topicDescription={topic.description}
        />
      ))}
    </div>
  )
}
