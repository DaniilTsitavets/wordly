import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { IconFont } from '@/components/atoms/IconFont'
import { Button } from '@/components/atoms/Button'
import type { RecallInterval, RecallResponse, RecallWord } from '@/api/recall'
import { useRecall } from './hooks/useRecall'
import styles from './RecallPage.module.scss'

const INTERVAL_STEPS: RecallInterval[] = [1, 3, 7, 14, 21, 30]

interface IntervalConfig {
  days: RecallInterval
  bucketClass: string
  buttonClass: string
  badgeClass: string
}

const INTERVAL_CONFIG: Record<RecallInterval, IntervalConfig> = {
  1: {
    days: 1,
    bucketClass: styles.bucket1,
    buttonClass: styles.btn1,
    badgeClass: styles.badge1,
  },
  3: {
    days: 3,
    bucketClass: styles.bucket3,
    buttonClass: styles.btn3,
    badgeClass: styles.badge3,
  },
  7: {
    days: 7,
    bucketClass: styles.bucket7,
    buttonClass: styles.btn7,
    badgeClass: styles.badge7,
  },
  14: {
    days: 14,
    bucketClass: styles.bucket14,
    buttonClass: styles.btn14,
    badgeClass: styles.badge14,
  },
  21: {
    days: 21,
    bucketClass: styles.bucket21,
    buttonClass: styles.btn21,
    badgeClass: styles.badge21,
  },
  30: {
    days: 30,
    bucketClass: styles.bucket30,
    buttonClass: styles.btn30,
    badgeClass: styles.badge30,
  },
}

export function RecallPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useRecall()

  const buckets = useMemo(() => groupByInterval(data?.words ?? []), [data])
  const activeIntervals = useMemo(
    () => INTERVAL_STEPS.filter((d) => (buckets.get(d)?.length ?? 0) > 0).length,
    [buckets]
  )

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <Spinner />
      </div>
    )
  }

  if (error || !data) {
    return <div className={styles.error}>{error ?? 'Recall not available'}</div>
  }

  return (
    <div className={styles.page}>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigate('/')}
        aria-label="Back to Home"
      >
        <IconFont name="arrow-back" size={18} decorative />
        Back to Home
      </button>

      <div className={styles.heroBlock}>
        <div className={styles.brainIcon} aria-hidden="true">
          🧠
        </div>
        <h1 className={styles.title}>Active Recall Practice</h1>
        <p className={styles.description}>
          Review words at optimal intervals to strengthen your memory and achieve long-term
          retention.
        </p>
      </div>

      <SummaryCard
        total={data.total}
        activeIntervals={activeIntervals}
        onStartAll={() => navigate('/recall/practice')}
      />

      <section className={styles.scheduleSection}>
        <h2 className={styles.scheduleTitle}>Spaced Repetition Schedule</h2>
        <ul className={styles.scheduleList}>
          {INTERVAL_STEPS.map((days) => (
            <li key={days}>
              <IntervalCard
                days={days}
                words={buckets.get(days) ?? []}
                onStartPractice={() => navigate(`/recall/practice?interval=${days}`)}
              />
            </li>
          ))}
        </ul>
      </section>

      <HowItWorks />
    </div>
  )
}

interface SummaryCardProps {
  total: RecallResponse['total']
  activeIntervals: number
  onStartAll: () => void
}

function SummaryCard({ total, activeIntervals, onStartAll }: SummaryCardProps) {
  return (
    <section className={styles.summaryCard}>
      <div className={styles.summaryStats}>
        <div className={styles.summaryStat}>
          <span className={styles.summaryLabel}>Words Ready for Review</span>
          <span className={`${styles.summaryValue} ${styles.summaryValueBlue}`}>{total}</span>
        </div>
        <div className={`${styles.summaryStat} ${styles.summaryStatRight}`}>
          <span className={styles.summaryLabel}>Active Intervals</span>
          <span className={`${styles.summaryValue} ${styles.summaryValuePurple}`}>
            {activeIntervals}
          </span>
        </div>
      </div>

      <Button
        variant="gradient"
        size="lg"
        className={styles.startAllBtn}
        disabled={total === 0}
        onClick={onStartAll}
      >
        Start All Reviews
      </Button>
    </section>
  )
}

interface IntervalCardProps {
  days: RecallInterval
  words: RecallWord[]
  onStartPractice: () => void
}

function IntervalCard({ days, words, onStartPractice }: IntervalCardProps) {
  const config = INTERVAL_CONFIG[days]
  const isActive = words.length > 0

  return (
    <article
      className={`${styles.intervalCard} ${isActive ? styles.intervalActive : styles.intervalInactive}`}
    >
      <div className={`${styles.intervalIcon} ${config.bucketClass}`}>
        <span>{days}d</span>
      </div>

      <div className={styles.intervalInfo}>
        <div className={styles.intervalHeading}>
          <h3 className={styles.intervalTitle}>Interval {days === 1 ? '1 Day' : `${days} Days`}</h3>
          {isActive && (
            <span className={`${styles.wordsBadge} ${config.badgeClass}`}>
              {words.length} {words.length === 1 ? 'word' : 'words'}
            </span>
          )}
        </div>
        {isActive && (
          <p className={styles.intervalDue}>
            Due: <strong>Today</strong>
          </p>
        )}
      </div>

      <div className={styles.intervalAction}>
        {isActive ? (
          <Button
            variant="custom"
            size="md"
            className={`${styles.startBtn} ${config.buttonClass}`}
            rightIcon={<IconFont name="arrow-right" size={14} decorative />}
            onClick={onStartPractice}
          >
            Start Practice
          </Button>
        ) : (
          <Button variant="custom" size="md" className={styles.noWordsBtn} disabled>
            No words due
          </Button>
        )}
      </div>
    </article>
  )
}

function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <header className={styles.howItWorksHeader}>
        <IconFont name="info" size={20} color="#0ca5e9" decorative />
        <h2 className={styles.howItWorksTitle}>How Spaced Repetition Works</h2>
      </header>
      <ol className={styles.howItWorksList}>
        <li>
          <span className={styles.howItWorksStep}>1</span>
          <span>
            <strong>Complete lessons</strong> – Words enter the review queue after finishing a topic
          </span>
        </li>
        <li>
          <span className={styles.howItWorksStep}>2</span>
          <span>
            <strong>Review at intervals</strong> – Practice words at 1, 3, 7, 14, 21, and 30 day
            intervals
          </span>
        </li>
        <li>
          <span className={styles.howItWorksStep}>3</span>
          <span>
            <strong>Build long-term memory</strong> – Each successful review strengthens retention
            and moves words to the next interval
          </span>
        </li>
      </ol>
    </section>
  )
}

function groupByInterval(words: RecallWord[]): Map<RecallInterval, RecallWord[]> {
  const map = new Map<RecallInterval, RecallWord[]>()
  for (const step of INTERVAL_STEPS) {
    map.set(step, [])
  }
  for (const word of words) {
    const bucket = map.get(word.recall_interval)
    if (bucket) bucket.push(word)
  }
  return map
}
