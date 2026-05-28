import { Spinner } from '@/components/atoms/Spinner'
import { HomeTopicRow } from '@/components/molecules/HomeTopicRow/HomeTopicRow'
import type { HomeRowLockMode } from '@/components/molecules/HomeTopicRow/HomeTopicRow'
import { useAppSelector } from '@/store/hooks'
import { useTopics } from './hooks/useTopics'
import styles from './HomePage.module.scss'

export function HomePage() {
  const { topics, isLoading, error } = useTopics()
  const user = useAppSelector((state) => state.auth.user)
  const isGuest = !user || user.is_guest

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
    <div className={styles.page}>
      {topics.map((topic, index) => {
        let lockMode: HomeRowLockMode = 'auto'
        if (isGuest) {
          lockMode = index === 0 ? 'first-only' : 'all-locked'
        }
        return (
          <HomeTopicRow
            key={topic.id}
            topicId={topic.id}
            topicTitle={topic.name}
            topicDescription={topic.description}
            lockMode={lockMode}
          />
        )
      })}
    </div>
  )
}
