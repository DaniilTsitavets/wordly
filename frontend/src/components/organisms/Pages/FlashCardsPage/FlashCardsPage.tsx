import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/molecules/Card/Card'
import testImg from '@/assets/test_img/test_img2.jpg'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import { RewardModal } from '@/components/molecules/RewardModal'
import { useWords } from '@/shared/hooks/useWords'
import { useActivityHeartbeat } from '@/shared/hooks/useActivityHeartbeat'
import { completeSession } from '@/api/completeSession'
import { useAppDispatch } from '@/store/hooks'
import { addGems } from '@/store/slices/authSlice'
import styles from './FlashCardsPage.module.scss'

export const FlashCardsPage = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>()
  const navigate = useNavigate()
  const { finishSession, isCompleting } = useFinishSession()
  const { words, isLoading, error } = useWords(Number(subtopicId))
  useActivityHeartbeat()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [gemsEarned, setGemsEarned] = useState(0)

  const handlePlayAudio = useCallback(() => {
    const currentWord = words?.[currentIndex]
    if ('speechSynthesis' in window && currentWord?.word_en) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word_en)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }, [words, currentIndex])

  if (isLoading) {
    return <div className={styles.centered}>Loading...</div>
  }

  if (error) {
    return <div className={styles.centered}>Error: {error}</div>
  }

  if (!words || words.length === 0) {
    return <div className={styles.centered}>No words found</div>
  }

  const word = words[currentIndex]
  const isLast = currentIndex >= words.length - 1
  const isFirst = currentIndex === 0
  const progress = ((currentIndex + 1) / words.length) * 100

  const handleNext = () => {
    if (!isLast) {
      setIsCardFlipped(false)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsCardFlipped(false)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (isCompleting) return
    try {
      const result = await finishSession(Number(subtopicId), 'flashcards')
      setGemsEarned(result.gemsEarned)
      setShowReward(true)
    } catch {
      // TODO: show error toast
    }
  }

  const handleCollect = () => {
    setShowReward(false)
    sessionStorage.setItem('sessionCompleted', 'true')
    navigate(-1)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack} aria-label="Go back">
          <IconFont name="arrow-back" size={20} />
        </button>
        <ProgressBar value={progress} />
      </div>
      <p>{`Card ${currentIndex + 1} of ${words.length}`}</p>

      <Card
        id={word.id}
        wordEn={word.word_en}
        transcriptionEn={word.transcription_en}
        translationRu={word.translation_ru}
        imageUrl={word.image_url || testImg}
        hasMnemonic={false}
        mnemonicText={undefined}
        usageExampleEn={word.usage_example_en}
        usageExampleRu={word.usage_example_ru}
        isFlipped={isCardFlipped}
        onFlip={() => setIsCardFlipped((prev) => !prev)}
        onPlayAudio={handlePlayAudio}
      />

      <div className={styles.cardsActions}>
        <Button size="md" variant="secondary" onClick={handlePrevious} disabled={isFirst}>
          <IconFont name="arrow-back" size={14} /> Previous
        </Button>
        {isLast ? (
          <Button size="md" variant="gradient" onClick={handleComplete} disabled={isCompleting}>
            {isCompleting ? 'Completing...' : 'Complete'}
          </Button>
        ) : (
          <Button size="md" variant="gradient" onClick={handleNext}>
            Next <IconFont name="arrow-right" size={14} />
          </Button>
        )}
      </div>

      <RewardModal
        isOpen={showReward}
        onClose={() => setShowReward(false)}
        onCollect={handleCollect}
        completionTarget={Number(subtopicId) || 1}
        reward={`+${gemsEarned} Gems`}
      />
    </section>
  )
}
