import styles from './FillingGapsPage.module.scss'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import { Input } from '@/components/atoms/Input'
import { useWords } from '@/shared/hooks/useWords'
import { useActivityHeartbeat } from '@/shared/hooks/useActivityHeartbeat'
import { completeSession } from '@/api/completeSession'
import { RewardModal } from '@/components/molecules/RewardModal'
import { useAppDispatch } from '@/store/hooks'
import { addGems } from '@/store/slices/authSlice'

type AnswerState = 'pending' | 'correct' | 'incorrect'

/**
 * Creates a word with random letters replaced by underscores
 * @param word - The original word
 * @param gapRatio - Ratio of letters to hide (0-1)
 * @returns Word with gaps (underscores)
 */
const createWordWithGaps = (word: string, gapRatio: number = 0.4): string => {
  const letters = word.split('')
  const letterIndices: number[] = []

  letters.forEach((char, index) => {
    if (/[a-zA-Z]/.test(char)) {
      letterIndices.push(index)
    }
  })

  const numGaps = Math.max(1, Math.floor(letterIndices.length * gapRatio))

  const shuffled = [...letterIndices].sort(() => Math.random() - 0.5)
  const indicesToHide = new Set(shuffled.slice(0, numGaps))

  return letters.map((char, index) => (indicesToHide.has(index) ? '_' : char)).join('')
}

const normalizeAnswer = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]+$/, '')
}

export const FillingGapsPage = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { words, isLoading, error } = useWords(Number(subtopicId))
  useActivityHeartbeat()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [answerState, setAnswerState] = useState<AnswerState>('pending')
  const [showReward, setShowReward] = useState(false)
  const [gemsEarned, setGemsEarned] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const word = words?.[currentIndex]
  const isLast = currentIndex >= (words?.length ?? 0) - 1
  const progress = words?.length ? ((currentIndex + 1) / words.length) * 100 : 0

  const wordWithGaps = useMemo(() => {
    if (!word?.word_en) return ''
    return createWordWithGaps(word.word_en)
  }, [word?.word_en])

  useEffect(() => {
    setUserAnswer('')
    setAnswerState('pending')
  }, [currentIndex])

  const handleSpeak = useCallback(() => {
    if ('speechSynthesis' in window && word?.word_en) {
      const utterance = new SpeechSynthesisUtterance(word.word_en)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }, [word?.word_en])

  const handleReset = useCallback(() => {
    setUserAnswer('')
    setAnswerState('pending')
  }, [])

  const handleCheckAnswer = useCallback(() => {
    if (!word?.word_en) return
    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(word.word_en)
    setAnswerState(isCorrect ? 'correct' : 'incorrect')
  }, [userAnswer, word?.word_en])

  const handleNextWord = useCallback(() => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [isLast])

  const handleComplete = useCallback(async () => {
    if (isCompleting) return
    setIsCompleting(true)
    try {
      const result = await completeSession(Number(subtopicId), 'filling_gaps')
      setGemsEarned(result.gems_earned)
      dispatch(addGems(result.gems_earned))
      setShowReward(true)
    } catch {
      // TODO: show error toast
    } finally {
      setIsCompleting(false)
    }
  }, [dispatch, isCompleting, subtopicId])

  const handleCollect = useCallback(() => {
    setShowReward(false)
    sessionStorage.setItem('sessionCompleted', 'true')
    navigate(-1)
  }, [navigate])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserAnswer(e.target.value)
      if (answerState !== 'pending') {
        setAnswerState('pending')
      }
    },
    [answerState]
  )

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  if (isLoading) {
    return <div className={styles.centered}>Loading...</div>
  }

  if (error) {
    return <div className={styles.centered}>Error: {error}</div>
  }

  if (!words || words.length === 0 || !word) {
    return <div className={styles.centered}>No words found</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack} aria-label="Go back">
          <IconFont name="arrow-back" size={20} />
        </button>
        <div className={styles.progressContainer}>
          <ProgressBar value={progress} color="purple" size="sm" />
        </div>
      </div>

      <div className={styles.originalWord}>
        <div className={styles.wordPlate}>
          <span className={styles.wordWithGaps}>{wordWithGaps}</span>
        </div>

        <button
          className={styles.speakerButton}
          onClick={handleSpeak}
          aria-label="Hear pronunciation"
        >
          <IconFont name="player" size={16} />
          <span>Hear pronunciation</span>
        </button>
      </div>

      <Input
        value={userAnswer}
        onChange={handleInputChange}
        placeholder=""
        className={styles.answerInput}
      />
      {answerState !== 'pending' && (
        <div
          className={`${styles.feedbackBanner} ${
            answerState === 'correct' ? styles.correct : styles.incorrect
          }`}
        >
          {answerState === 'correct' ? (
            <>
              <IconFont name="filled-tick" size={24} />
              <span>Correct!</span>
            </>
          ) : (
            <>
              <IconFont name="cross" size={24} color="#fb2c36" />
              <span>Try Again</span>
            </>
          )}
        </div>
      )}

      <div className={styles.buttonsContainer}>
        {answerState === 'correct' ? (
          isLast ? (
            <Button variant="gradient" onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? 'Completing...' : 'Complete'}
            </Button>
          ) : (
            <Button variant="gradient" onClick={handleNextWord}>
              Next Word →
            </Button>
          )
        ) : (
          <>
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="gradient" onClick={handleCheckAnswer}>
              Check Answer
            </Button>
          </>
        )}
      </div>

      <RewardModal
        isOpen={showReward}
        onClose={() => setShowReward(false)}
        onCollect={handleCollect}
        completionTarget={Number(subtopicId) || 1}
        reward={`+${gemsEarned} Gems`}
      />
    </div>
  )
}
