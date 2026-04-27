import { useNavigate } from 'react-router-dom'
import { IconFont } from '@/components/atoms/IconFont'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Button } from '@/components/atoms/Button'
import styles from './SubtopicCard.module.scss'
import type { SubtopicCardData } from './types/types'

type SubtopicTheme = 'orange' | 'skyBlue' | 'pink'

interface SubtopicCardProps extends SubtopicCardData {
  themeIndex?: number
}

const CARD_THEMES: SubtopicTheme[] = ['orange', 'skyBlue', 'pink']

export function SubtopicCard({
  id,
  title,
  imageUrl,
  description,
  wordCount,
  topicTitle,
  status,
  themeIndex,
}: SubtopicCardProps) {
  const navigate = useNavigate()
  const resolvedThemeIndex = themeIndex ?? id - 1
  const activeTheme =
    CARD_THEMES[
      ((resolvedThemeIndex % CARD_THEMES.length) + CARD_THEMES.length) % CARD_THEMES.length
    ]
  const isLocked = status === 'locked'

  return (
    <section
      className={`${styles.card} ${isLocked ? styles['card--locked'] : styles[`card--${activeTheme}`]}`}
    >
      {isLocked && (
        <div className={styles.lockBadge} aria-label="Locked">
          <IconFont name="lock" size={16} />
        </div>
      )}

      {imageUrl && (
        <div className={styles.image__container}>
          <img src={imageUrl} alt={`${title} illustration`} loading="lazy" decoding="async" />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.text}>
          <h3 className={styles.text__title}>{title}</h3>
          <p className={styles.text__description}>{description}</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.icon__container}>
            <IconFont name="star" size="1rem" />
          </div>
          <span className={styles.word__count}>{wordCount} words</span>
          <ProgressBar value={50} showValue={true} />
        </div>

        {isLocked ? (
          <Button variant="custom" className={styles.button__locked} disabled>
            <IconFont name="lock" size="1.25rem" /> Locked
          </Button>
        ) : (
          <Button
            variant="custom"
            className={`${styles.button__start} ${styles[`button__start--${activeTheme}`]}`}
            onClick={() => {
              const toSlug = (url: string) => url.toLowerCase().replace(/\s+/g, '-')
              navigate(`/${toSlug(topicTitle)}/${toSlug(title)}/${id}`)
            }}
          >
            <IconFont name="play" size="1.25rem" /> Start Learning
          </Button>
        )}
      </div>
    </section>
  )
}
