import { useEffect, useState } from 'react'
import { getAdminSubtopics, getAdminTopics } from '../../../../api/admin'
import styles from './AdminDashboard.module.scss'

type ActivityType =
  | 'topic_created'
  | 'subtopic_created'
  | 'word_added'
  | 'topic_updated'
  | 'word_deleted'

interface RecentActivity {
  id: number
  type: ActivityType
  title: string
  description: string
  date: string
}

const activityIcons: Record<ActivityType, string> = {
  topic_created: '✅',
  subtopic_created: '📁',
  word_added: '📝',
  topic_updated: '🔄',
  word_deleted: '🗑️',
}

const recentActivities: RecentActivity[] = [
  {
    id: 1,
    type: 'topic_created',
    title: 'Topic Created',
    description: 'Food & Drinks added',
    date: 'Today',
  },
]

export const AdminDashboard = () => {
  const [totalTopics, setTotalTopics] = useState<number | null>(null)
  const [totalWords, setTotalWords] = useState<number | null>(null)

  useEffect(() => {
    getAdminTopics().then(async (topics) => {
      setTotalTopics(topics.length)
      const subtopicsPerTopic = await Promise.all(topics.map((t) => getAdminSubtopics(t.id)))
      const wordCount = subtopicsPerTopic.flat().reduce((sum, s) => sum + s.words_count, 0)
      setTotalWords(wordCount)
    })
  }, [])

  const avgWordsPerTopic =
    totalTopics && totalWords !== null
      ? totalTopics > 0
        ? (totalWords / totalTopics).toFixed(1)
        : '0.0'
      : null

  const stats = [
    {
      label: 'Total Topics',
      value: totalTopics !== null ? String(totalTopics) : '…',
      color: 'blue' as const,
    },
    {
      label: 'Total Words',
      value: totalWords !== null ? String(totalWords) : '…',
      color: 'purple' as const,
    },
    { label: 'Avg Words/Topic', value: avgWordsPerTopic ?? '…', color: 'orange' as const },
  ]

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Dashboard Overview</h2>
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={`${styles.statCard} ${styles[stat.color]}`}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.activitySection}>
        <h2 className={styles.activityTitle}>Recent Activity</h2>
        <ul className={styles.activityList}>
          {recentActivities.map((activity) => (
            <li key={activity.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>{activityIcons[activity.type]}</span>
              <div className={styles.activityInfo}>
                <span className={styles.activityName}>{activity.title}</span>
                <span className={styles.activityDescription}>{activity.description}</span>
              </div>
              <span className={styles.activityDate}>{activity.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
