import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/molecules/Card/Card'
import testImg from '@/assets/test_img/test_img2.jpg'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import { RewardModal } from '@/components/molecules/RewardModal'
import { useWords } from './hooks/useWords'
import { completeSession } from '@/api/completeSession'
import styles from './FlashCardsPage.module.scss'

export const FlashCardsPage = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>()
  const navigate = useNavigate()
  const { words, isLoading, error } = useWords(Number(subtopicId))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [gemsEarned, setGemsEarned] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

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
    setIsCompleting(true)
    try {
      const result = await completeSession(Number(subtopicId), 'flashcards')
      setGemsEarned(result.gems_earned)
      setShowReward(true)
    } catch {
      // TODO: show error toast
    } finally {
      setIsCompleting(false)
    }
  }

  const handleCollect = () => {
    setShowReward(false)
    navigate(-1)
  }

  return (
    <section className={styles.container}>
      <ProgressBar value={progress} />
      <p>{`Card ${currentIndex + 1} of ${words.length}`}</p>

      <Card
        id={word.id}
        wordEn={word.word_en}
        transcriptionEn={word.transcription_en}
        translationRu={word.translation_ru}
        imageUrl={word.image_url || testImg}
        hasMnemonic={word.has_mnemonic}
        mnemonicText={word.mnemonic_text}
        usageExampleEn={word.usage_example_en}
        usageExampleRu={word.usage_example_ru}
        isFlipped={isCardFlipped}
        onFlip={() => setIsCardFlipped((prev) => !prev)}
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
        reward={`+${gemsEarned} Gems`}
      />
    </section>
  )
}
