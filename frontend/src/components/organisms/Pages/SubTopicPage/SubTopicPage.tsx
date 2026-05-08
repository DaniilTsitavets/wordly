import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { Spinner } from '@/components/atoms/Spinner'
import { IconFont } from '@/components/atoms/IconFont'
import { Button } from '@/components/atoms/Button'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import type { LevelProgress } from '@/api/topics'
import { useSubtopic } from './hooks/useSubtopic'
import { MECHANIC_INFO } from './utils/mechanics'
import styles from './SubTopicPage.module.scss'

const DAILY_GOAL_PROGRESS_STUB = 75

export function SubTopicPage() {
  const { subtopicId } = useParams<{ subtopicId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const id = Number(subtopicId)
  const { subtopic, isLoading, error, refetch } = useSubtopic(id)

  const checkSessionCompleted = useCallback(() => {
    const sessionCompleted = sessionStorage.getItem('sessionCompleted')
    if (sessionCompleted === 'true') {
      sessionStorage.removeItem('sessionCompleted')
      refetch()
    }
  }, [refetch])

  useEffect(() => {
    checkSessionCompleted()
  }, [checkSessionCompleted, location.key])

  useEffect(() => {
    const handleFocus = () => {
      checkSessionCompleted()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [checkSessionCompleted])

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <Spinner />
      </div>
    )
  }

  if (error || !subtopic) {
    return <div className={styles.error}>{error ?? 'Subtopic not found'}</div>
  }

  const currentLevel = pickCurrentLevel(subtopic.levels)
  const currentLevelIndex = currentLevel
    ? subtopic.levels.findIndex((l) => l.mechanic_type === currentLevel.mechanic_type)
    : -1

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IconFont name="arrow-back" size={22} decorative />
          </button>
          <div className={styles.titleBlock}>
            <p className={styles.kicker}>Current Topic</p>
            <h1 className={styles.title}>{subtopic.name}</h1>
            <p className={styles.description}>{subtopic.description}</p>
          </div>
        </div>

        <div className={styles.dailyGoal}>
          <div className={styles.dailyGoalRow}>
            <span className={styles.dailyGoalLabel}>Daily Goal</span>
            <span className={styles.dailyGoalValue}>{DAILY_GOAL_PROGRESS_STUB}%</span>
          </div>
          <ProgressBar value={DAILY_GOAL_PROGRESS_STUB} color="green" size="sm" />
        </div>
      </div>

      {currentLevel && (
        <CurrentLevelCard
          level={currentLevel}
          levelIndex={currentLevelIndex}
          imageUrl={subtopic.image_url}
          wordsCount={subtopic.words_count}
          onStart={() => {
            if (currentLevel.mechanic_type === 'flashcards') {
              navigate(`/subtopics/${subtopic.id}/flashcards`)
            } else if (currentLevel.mechanic_type === 'mnemonic_cards') {
              navigate(`/subtopics/${subtopic.id}/mnemonic-cards`)
            } else if (currentLevel.mechanic_type === 'matching') {
              navigate(`/subtopics/${subtopic.id}/matching`)
            } else if (currentLevel.mechanic_type === 'word_builder') {
              navigate(`/subtopics/${subtopic.id}/word-builder`)
            } else if (currentLevel.mechanic_type === 'filling_gaps') {
              navigate(`/subtopics/${subtopic.id}/filling-gaps`)
            }
          }}
        />
      )}

      <section className={styles.pathSection}>
        <h2 className={styles.pathTitle}>
          <IconFont name="hierarchy" size={18} decorative />
          Learning Path
        </h2>
        {subtopic.levels.map((level, index) => (
          <LearningPathRow
            key={level.mechanic_type}
            level={level}
            levelIndex={index}
            subtopicId={subtopic.id}
          />
        ))}
      </section>
    </div>
  )
}

function pickCurrentLevel(levels: LevelProgress[]): LevelProgress | null {
  return (
    levels.find((l) => l.status === 'in_progress') ??
    levels.find((l) => l.status === 'unblocked') ??
    null
  )
}

interface CurrentLevelCardProps {
  level: LevelProgress
  levelIndex: number
  imageUrl: string
  wordsCount: number
  onStart: () => void
}

function CurrentLevelCard({
  level,
  levelIndex,
  imageUrl,
  wordsCount,
  onStart,
}: CurrentLevelCardProps) {
  const info = MECHANIC_INFO[level.mechanic_type]
  return (
    <div className={styles.currentLevelCard}>
      <div className={styles.currentLevelText}>
        <span className={styles.levelTag}>
          <IconFont name="star" size={14} decorative />
          Level {levelIndex}
        </span>
        <h2 className={styles.levelTitle}>{info.label}</h2>
        <p className={styles.levelDescription}>{info.description}</p>
        <Button
          variant="gradient"
          size="lg"
          className={styles.startBtn}
          leftIcon={<IconFont name="play" size={16} decorative />}
          onClick={onStart}
        >
          Start Learning
        </Button>
      </div>

      <div className={styles.imageWrapper}>
        <img src={imageUrl} alt={info.label} loading="lazy" />
        <span className={styles.cardsBadge}>
          <IconFont name="image" size={14} decorative />
          {wordsCount} New Cards
        </span>
      </div>
    </div>
  )
}

interface LearningPathRowProps {
  level: LevelProgress
  levelIndex: number
  subtopicId: number
}

function LearningPathRow({ level, levelIndex, subtopicId }: LearningPathRowProps) {
  const info = MECHANIC_INFO[level.mechanic_type]
  const statusClass =
    level.status === 'completed'
      ? styles.completed
      : level.status === 'in_progress' || level.status === 'unblocked'
        ? styles.inProgress
        : styles.locked

  const navigate = useNavigate()

  return (
    <div className={`${styles.levelRow} ${statusClass}`}>
      <div className={styles.levelIcon}>
        {level.status === 'completed' ? (
          <IconFont name="tick3" size={18} color="#16a34a" decorative />
        ) : level.status === 'locked' ? (
          <IconFont name="lock" size={16} color="#9ca3af" decorative />
        ) : (
          <IconFont name={info.icon} size={18} color="#ec4899" decorative />
        )}
      </div>
      <div className={styles.levelInfo}>
        <p className={styles.levelName}>
          Level {levelIndex}: {info.label}
        </p>
        <p className={styles.levelDesc}>{info.description}</p>
      </div>
      <div className={styles.levelAction}>
        {level.status === 'completed' && <span className={styles.statusBadge}>Completed</span>}
        {(level.status === 'in_progress' || level.status === 'unblocked') && (
          <Button
            variant="gradient"
            size="sm"
            className={styles.startSmallBtn}
            onClick={() => {
              if (level.mechanic_type === 'flashcards') {
                navigate(`/subtopics/${subtopicId}/flashcards`)
              } else if (level.mechanic_type === 'mnemonic_cards') {
                navigate(`/subtopics/${subtopicId}/mnemonic-cards`)
              } else if (level.mechanic_type === 'matching') {
                navigate(`/subtopics/${subtopicId}/matching`)
              } else if (level.mechanic_type === 'word_builder') {
                navigate(`/subtopics/${subtopicId}/word-builder`)
              } else if (level.mechanic_type === 'filling_gaps') {
                navigate(`/subtopics/${subtopicId}/filling-gaps`)
              }
            }}
          >
            Start
          </Button>
        )}
        {level.status === 'locked' && <span className={styles.lockedText}>Locked</span>}
      </div>
    </div>
  )
}
