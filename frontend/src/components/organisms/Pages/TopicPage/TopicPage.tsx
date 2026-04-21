import { SubtopicsSection } from '@/components/molecules/TopicsSection'
import styles from './TopicPage.module.scss'
import { useTopicData } from './useTopicData'

const TOPIC_ID = '1'

export function TopicPage() {
  const { title, description, subtopics, isLoading, error } = useTopicData(TOPIC_ID)

  return (
    <main className={styles.pageContent}>
      <SubtopicsSection
        topicTitle={title}
        topicDescription={description}
        subtopics={subtopics}
        isLoading={isLoading}
        error={error}
      />
    </main>
  )
}
