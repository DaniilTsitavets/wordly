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
  themeIndex,
}: SubtopicCardProps) {
  const resolvedThemeIndex = themeIndex ?? id - 1
  const activeTheme =
    CARD_THEMES[
      ((resolvedThemeIndex % CARD_THEMES.length) + CARD_THEMES.length) % CARD_THEMES.length
    ]

  return (
    <section className={`${styles.card} ${styles[`card--${activeTheme}`]}`}>
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

        <Button
          variant="custom"
          className={`${styles.button__start} ${styles[`button__start--${activeTheme}`]}`}
        >
          <IconFont name="play" size="1.25rem" /> Start Learning
        </Button>
      </div>
    </section>
  )
}
