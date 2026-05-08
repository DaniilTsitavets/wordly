import styles from './WordBuilder.module.scss'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Button } from '@/components/atoms/Button'
import { LetterTile } from '@/components/atoms/LetterTile'
import { RewardModal } from '@/components/molecules/RewardModal'
import { IconFont } from '@/components/atoms/IconFont'
import { useWords } from '@/shared/hooks/useWords'
import { completeSession } from '@/api/completeSession'
import testImg from '@/assets/test_img/test_img2.jpg'

type AnswerState = 'pending' | 'correct' | 'incorrect'

interface LetterItem {
  letter: string
  originalIndex: number
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const WordBuilderPage = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>()
  const navigate = useNavigate()
  const { words, isLoading, error } = useWords(Number(subtopicId))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [answerState, setAnswerState] = useState<AnswerState>('pending')
  const [showReward, setShowReward] = useState(false)
  const [gemsEarned, setGemsEarned] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const word = words?.[currentIndex]
  const isLast = currentIndex >= (words?.length ?? 0) - 1
  const progress = words?.length ? ((currentIndex + 1) / words.length) * 100 : 0

  const shuffledLetters = useMemo<LetterItem[]>(() => {
    if (!word?.word_en) return []
    const letters = word.word_en
      .toLowerCase()
      .split('')
      .map((letter, index) => ({
        letter,
        originalIndex: index,
      }))
    return shuffleArray(letters)
  }, [word?.word_en])

  useEffect(() => {
    setSelectedIndices([])
    setAnswerState('pending')
  }, [currentIndex])

  const currentAnswer = useMemo(() => {
    return selectedIndices.map((idx) => shuffledLetters[idx]?.letter || '').join('')
  }, [selectedIndices, shuffledLetters])

  const handleSpeak = useCallback(() => {
    if ('speechSynthesis' in window && word?.word_en) {
      const utterance = new SpeechSynthesisUtterance(word.word_en)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }, [word?.word_en])

  const handleLetterClick = useCallback(
    (shuffledIndex: number) => {
      if (selectedIndices.includes(shuffledIndex)) return
      setSelectedIndices((prev) => [...prev, shuffledIndex])
      setAnswerState('pending')
    },
    [selectedIndices]
  )

  const handleAnswerLetterClick = useCallback((position: number) => {
    setSelectedIndices((prev) => prev.filter((_, idx) => idx !== position))
    setAnswerState('pending')
  }, [])

  const handleReset = useCallback(() => {
    setSelectedIndices([])
    setAnswerState('pending')
  }, [])

  const handleCheckAnswer = useCallback(() => {
    if (!word?.word_en) return
    const isCorrect = currentAnswer.toLowerCase() === word.word_en.toLowerCase()
    setAnswerState(isCorrect ? 'correct' : 'incorrect')
  }, [currentAnswer, word?.word_en])

  const handleNextWord = useCallback(() => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [isLast])

  const handleComplete = useCallback(async () => {
    if (isCompleting) return
    setIsCompleting(true)
    try {
      const result = await completeSession(Number(subtopicId), 'word_builder')
      setGemsEarned(result.gems_earned)
      setShowReward(true)
    } catch {
      // TODO: show error toast
    } finally {
      setIsCompleting(false)
    }
  }, [isCompleting, subtopicId])

  const handleCollect = useCallback(() => {
    setShowReward(false)
    sessionStorage.setItem('sessionCompleted', 'true')
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
      <div className={styles.progressContainer}>
        <ProgressBar value={progress} color="purple" size="sm" />
      </div>

      <div className={styles.imageContainer}>
        <img src={word.image_url || testImg} alt={word.word_en} className={styles.wordImage} />
      </div>

      <div className={styles.promptContainer}>
        <span className={styles.promptLabel}>Translate into English:</span>
        <div className={styles.wordContainer}>
          <span className={styles.word}>{word.translation_ru}</span>
          <button
            className={styles.speakerButton}
            onClick={handleSpeak}
            aria-label="Listen to pronunciation"
          >
            <IconFont name="player" size={20} />
          </button>
        </div>
      </div>

      <div className={styles.answerPlate}>
        {selectedIndices.length === 0 ? (
          <span className={styles.placeholder}>Build the word from the letters below...</span>
        ) : (
          <div className={styles.answerLetters}>
            {selectedIndices.map((shuffledIdx, position) => {
              const letterItem = shuffledLetters[shuffledIdx]
              if (!letterItem) return null
              return (
                <LetterTile
                  key={`answer-${position}`}
                  letter={letterItem.letter}
                  state="correct"
                  onClick={() => handleAnswerLetterClick(position)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Letter Tiles */}
      <div className={styles.lettersContainer}>
        {shuffledLetters.map((item, shuffledIdx) => {
          const isSelected = selectedIndices.includes(shuffledIdx)
          return (
            <LetterTile
              key={`letter-${shuffledIdx}`}
              letter={item.letter}
              state={isSelected ? 'incorrect' : 'default'}
              onClick={() => handleLetterClick(shuffledIdx)}
              disabled={isSelected}
            />
          )
        })}
      </div>

      {answerState !== 'pending' && (
        <div
          className={`${styles.feedbackBanner} ${
            answerState === 'correct' ? styles.correct : styles.incorrect
          }`}
        >
          {answerState === 'correct' ? (
            <>
              <IconFont name="tick3" size={24} />
              <span>Correct!</span>
            </>
          ) : (
            <>
              <IconFont name="cross2" size={24} />
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
        reward={`+${gemsEarned} Gems`}
      />
    </div>
  )
}
