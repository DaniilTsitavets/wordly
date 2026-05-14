import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { IconFont } from '@/components/atoms/IconFont'
import type { VocabularyWord } from '@/api/vocabulary'
import { useVocabulary } from './hooks/useVocabulary'
import styles from './VocabularyPage.module.scss'

const CARD_COLOR_CLASSES = [styles.cardBlue, styles.cardYellow, styles.cardPink, styles.cardGreen]

export function VocabularyPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useVocabulary()

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <Spinner />
      </div>
    )
  }

  if (error || !data) {
    return <div className={styles.error}>{error ?? 'Vocabulary not found'}</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IconFont name="arrow-back" size={22} decorative />
        </button>
        <h1 className={styles.title}>My Vocabulary</h1>
      </div>

      <section className={styles.totalCard}>
        <div className={styles.totalHeader}>
          <IconFont name="book" size={20} color="#1a1a1a" decorative />
          <h2 className={styles.totalTitle}>Total Words Learned</h2>
        </div>
        <p className={styles.totalSubtitle}>You've learned {data.total} words so far!</p>
      </section>

      <ul className={styles.list}>
        {data.words.map((word, index) => (
          <li key={word.id} className={styles.listItem}>
            <WordCard
              word={word}
              colorClass={CARD_COLOR_CLASSES[index % CARD_COLOR_CLASSES.length]}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

interface WordCardProps {
  word: VocabularyWord
  colorClass: string
}

function WordCard({ word, colorClass }: WordCardProps) {
  const reviewIn = formatReviewIn(word.next_recall)
  const interval = formatInterval(word.next_recall)

  return (
    <article className={`${styles.card} ${colorClass}`}>
      <div className={styles.cardMain}>
        <div className={styles.cardHeading}>
          <span className={styles.wordEn}>{word.word_en}</span>
          <span className={styles.wordRu}>{word.translation_ru}</span>
        </div>
        {word.transcription_en && <p className={styles.transcription}>[{word.transcription_en}]</p>}
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <IconFont name="calendar" size={14} decorative />
            Status: {formatStatus(word.status)}
          </span>
        </div>
      </div>

      <div className={styles.cardAside}>
        {reviewIn && <span className={styles.reviewBadge}>Review {reviewIn}</span>}
        {interval && <span className={styles.intervalLabel}>Interval: {interval}</span>}
      </div>
    </article>
  )
}

function formatStatus(status: VocabularyWord['status']): string {
  switch (status) {
    case 'new':
      return 'new'
    case 'learning':
      return 'learning'
    case 'recalling':
      return 'recalling'
    case 'long_term_memory':
      return 'long-term'
  }
}

function diffInDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

function formatReviewIn(nextRecall: string | null): string | null {
  if (!nextRecall) return null
  const target = new Date(nextRecall)
  if (Number.isNaN(target.getTime())) return null
  const today = startOfDay(new Date())
  const days = diffInDays(today, startOfDay(target))
  if (days <= 0) return 'now'
  return `in ${days}d`
}

function formatInterval(nextRecall: string | null): string | null {
  if (!nextRecall) return null
  const target = new Date(nextRecall)
  if (Number.isNaN(target.getTime())) return null
  const today = startOfDay(new Date())
  const days = Math.max(1, diffInDays(today, startOfDay(target)))
  return `${days}d`
}

function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}
