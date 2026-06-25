import { useNavigate } from 'react-router-dom'
import { IconFont } from '@/components/atoms/IconFont'
import { Button } from '@/components/atoms/Button'
import styles from './HomeSubtopicCard.module.scss'

export interface HomeSubtopicCardData {
  id: number
  title: string
  description: string
  imageUrl: string
  wordCount: number
  topicTitle: string
  isLocked: boolean
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-')
}

export function HomeSubtopicCard({
  id,
  title,
  description,
  imageUrl,
  wordCount,
  topicTitle,
  isLocked,
}: HomeSubtopicCardData) {
  const navigate = useNavigate()

  return (
    <article
      className={`${styles.card} ${isLocked ? styles.locked : styles.active}`}
      aria-label={isLocked ? `${title} (locked)` : title}
    >
      <div className={styles.hero}>
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" />
        ) : (
          <span className={styles.heroFallback}>{title}</span>
        )}
        <div className={styles.cornerRight} aria-hidden="true">
          <IconFont name={isLocked ? 'lock' : 'info'} size={14} />
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.stats}>
          <IconFont name="star" size={14} color="#f0b100" decorative />
          <span>{wordCount} words</span>
        </div>

        {isLocked ? (
          <Button variant="custom" className={styles.lockedBtn} disabled>
            <IconFont name="lock" size={14} decorative />
            Locked
          </Button>
        ) : (
          <Button
            variant="custom"
            className={styles.startBtn}
            onClick={() => navigate(`/${toSlug(topicTitle)}/${toSlug(title)}/${id}`)}
          >
            <IconFont name="play" size={14} decorative />
            Start Learning
          </Button>
        )}
      </div>
    </article>
  )
}
