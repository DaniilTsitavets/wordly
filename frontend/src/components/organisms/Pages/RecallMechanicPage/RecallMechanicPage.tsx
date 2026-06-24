import styles from './RecallMechanic.module.scss'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/atoms/Button'
import { LetterTile } from '@/components/atoms/LetterTile'
import { RewardModal } from '@/components/molecules/RewardModal'
import { IconFont } from '@/components/atoms/IconFont'
import { getRecall, type RecallWord, recallAnswer, recallComplete } from '@/api/recall'
import { useAppDispatch } from '@/store/hooks'
import { addGems } from '@/store/slices/authSlice'

type GameState = 'building' | 'correct' | 'incorrect'

interface LetterItem {
  letter: string
  id: number
}

const EXTRA_LETTERS = 'abcdefghijklmnopqrstuvwxyz'

function generateDistractors(word: string, count: number): string[] {
  const wordLetters = new Set(word.toLowerCase().split(''))
  const pool = EXTRA_LETTERS.split('').filter((l) => !wordLetters.has(l))
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return result
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function formatTime(seconds: number): string {
  return `${seconds.toFixed(1)}s`
}

function getBestTimeKey(wordId: number): string {
  return `recall_best_time_${wordId}`
}

function getBestTime(wordId: number): number | null {
  const val = localStorage.getItem(getBestTimeKey(wordId))
  return val ? parseFloat(val) : null
}

function saveBestTime(wordId: number, time: number): void {
  const current = getBestTime(wordId)
  if (current === null || time < current) {
    localStorage.setItem(getBestTimeKey(wordId), time.toFixed(1))
  }
}

export function RecallMechanicPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const intervalFilter = searchParams.get('interval')

  const [words, setWords] = useState<RecallWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [gameState, setGameState] = useState<GameState>('building')
  const [showReward, setShowReward] = useState(false)
  const [gemsEarned, setGemsEarned] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await getRecall()
        if (cancelled) return
        let filtered = data.words
        if (intervalFilter) {
          const iv = parseInt(intervalFilter, 10)
          filtered = filtered.filter((w) => w.recall_interval === iv)
        }
        setWords(filtered)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load words')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [intervalFilter])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    startTimeRef.current = Date.now()
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000)
    }, 100)
  }, [stopTimer])

  useEffect(() => {
    if (words.length > 0) startTimer()
    return stopTimer
  }, [currentIndex, words.length, startTimer, stopTimer])

  const word = words[currentIndex]
  const isLast = currentIndex >= words.length - 1

  const shuffledLetters = useMemo<LetterItem[]>(() => {
    if (!word?.word_en) return []
    const correct = word.word_en.toLowerCase().split('')
    const distractorCount = Math.max(3, Math.floor(correct.length * 0.6))
    const distractors = generateDistractors(word.word_en, distractorCount)
    const all = [...correct, ...distractors].map((letter, id) => ({ letter, id }))
    return shuffleArray(all)
  }, [word?.word_en])

  const currentAnswer = useMemo(
    () => selectedIndices.map((idx) => shuffledLetters[idx]?.letter ?? '').join(''),
    [selectedIndices, shuffledLetters]
  )

  const bestTime = useMemo(() => (word ? getBestTime(word.id) : null), [word])

  const handleLetterClick = useCallback(
    (idx: number) => {
      if (gameState !== 'building') return
      if (selectedIndices.includes(idx)) return
      setSelectedIndices((prev) => [...prev, idx])
    },
    [gameState, selectedIndices]
  )

  const handleAnswerLetterClick = useCallback(
    (position: number) => {
      if (gameState !== 'building') return
      setSelectedIndices((prev) => prev.filter((_, i) => i !== position))
    },
    [gameState]
  )

  const handleCheck = useCallback(async () => {
    if (!word) return
    stopTimer()

    try {
      const res = await recallAnswer(word.id, currentAnswer)
      if (res.is_correct) {
        saveBestTime(word.id, elapsed)
        setGameState('correct')
      } else {
        setGameState('incorrect')
      }
    } catch {
      const isCorrect = currentAnswer.toLowerCase() === word.word_en.toLowerCase()
      if (isCorrect) {
        saveBestTime(word.id, elapsed)
        setGameState('correct')
      } else {
        setGameState('incorrect')
      }
    }
  }, [word, currentAnswer, elapsed, stopTimer])

  const handleTryAgain = useCallback(() => {
    setSelectedIndices([])
    setGameState('building')
    startTimer()
  }, [startTimer])

  const handleNextWord = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
    setSelectedIndices([])
    setGameState('building')
  }, [])

  const handleComplete = useCallback(async () => {
    if (isCompleting) return
    setIsCompleting(true)
    try {
      const result = await recallComplete()
      setGemsEarned(result.gems_earned)
      dispatch(addGems(result.gems_earned))
      setShowReward(true)
    } catch {
      setShowReward(true)
    } finally {
      setIsCompleting(false)
    }
  }, [dispatch, isCompleting])

  const handleCollect = useCallback(() => {
    setShowReward(false)
    navigate('/recall')
  }, [navigate])

  const handleBack = useCallback(() => {
    stopTimer()
    navigate('/recall')
  }, [navigate, stopTimer])

  if (isLoading) {
    return <div className={styles.centered}>Loading...</div>
  }

  if (error) {
    return <div className={styles.centered}>Error: {error}</div>
  }

  if (!words.length || !word) {
    return (
      <div className={styles.centered}>
        <p>No words due for review</p>
        <Button variant="secondary" onClick={() => navigate('/recall')}>
          Back to Recall
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack} aria-label="Go back">
          <IconFont name="arrow-back" size={18} />
        </button>
        <div className={styles.timerBadge}>
          <IconFont name="timer" size={16} />
          <span>{formatTime(elapsed)}</span>
        </div>
        <div className={styles.intervalBadge}>
          Interval: +{word.recall_interval} day{word.recall_interval > 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.promptSection}>
        <div className={styles.wordImageWrap}>
          <span className={styles.wordEmoji} role="img" aria-label="word illustration">
            🥗
          </span>
        </div>
        <span className={styles.promptLabel}>Translate to English:</span>
        <h2 className={styles.promptWord}>
          {word.translation_ru.charAt(0).toUpperCase() + word.translation_ru.slice(1)}
        </h2>
      </div>

      <div
        className={`${styles.answerPlate} ${
          gameState === 'correct'
            ? styles.answerCorrect
            : gameState === 'incorrect'
              ? styles.answerIncorrect
              : ''
        }`}
      >
        {selectedIndices.length === 0 ? (
          <span className={styles.placeholder}>Build the word from the letters below...</span>
        ) : (
          <div className={styles.answerLetters}>
            {selectedIndices.map((shuffledIdx, pos) => {
              const item = shuffledLetters[shuffledIdx]
              if (!item) return null
              return (
                <LetterTile
                  key={`ans-${pos}`}
                  letter={item.letter}
                  state="correct"
                  onClick={() => handleAnswerLetterClick(pos)}
                />
              )
            })}
          </div>
        )}
      </div>

      {bestTime !== null && (
        <div className={styles.bestTime}>
          <span className={styles.bestTimeIcon}>🏆</span>
          Personal Best: {formatTime(bestTime)}
        </div>
      )}

      <div className={styles.lettersPool}>
        {shuffledLetters.map((item, idx) => {
          const isUsed = selectedIndices.includes(idx)
          return (
            <LetterTile
              key={`pool-${idx}`}
              letter={item.letter}
              state={isUsed ? 'incorrect' : 'default'}
              onClick={() => handleLetterClick(idx)}
              disabled={isUsed}
            />
          )
        })}
      </div>

      {gameState !== 'building' && (
        <div
          className={`${styles.feedback} ${gameState === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
        >
          {gameState === 'correct' ? (
            <>
              <IconFont name="filled-tick" size={22} />
              <div className={styles.feedbackText}>
                <strong>Correct!</strong>
                <span>
                  Completed in <span className={styles.timeHighlight}>{formatTime(elapsed)}</span>
                </span>
              </div>
            </>
          ) : (
            <>
              <IconFont name="cross" size={22} color="#fb2c36" />
              <strong>Try Again</strong>
            </>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {gameState === 'correct' ? (
          isLast ? (
            <Button variant="gradient" onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? 'Completing...' : 'Complete Session'}
            </Button>
          ) : (
            <Button variant="gradient" onClick={handleNextWord}>
              Next Word →
            </Button>
          )
        ) : gameState === 'incorrect' ? (
          <>
            <Button variant="secondary" onClick={handleTryAgain}>
              Try Again
            </Button>
            <Button variant="gradient" onClick={handleCheck}>
              Check Answer
            </Button>
          </>
        ) : (
          <Button variant="gradient" onClick={handleCheck} disabled={selectedIndices.length === 0}>
            Check Answer
          </Button>
        )}
      </div>

      <div className={styles.progressDots}>
        {words.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : i < currentIndex ? styles.dotDone : ''}`}
          />
        ))}
      </div>

      <RewardModal
        isOpen={showReward}
        onClose={() => setShowReward(false)}
        onCollect={handleCollect}
        completionTarget="Recall"
        reward={`+${gemsEarned} Gems`}
      />
    </div>
  )
}
