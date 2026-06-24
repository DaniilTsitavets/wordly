import styles from './WordsMatchingPage.module.scss'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { RewardModal } from '@/components/molecules/RewardModal'
import { useWords } from '@/shared/hooks/useWords'
import { useActivityHeartbeat } from '@/shared/hooks/useActivityHeartbeat'
import { completeSession } from '@/api/completeSession'
import { useAppDispatch } from '@/store/hooks'
import { addGems } from '@/store/slices/authSlice'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MatchCard } from '@/components/atoms/MatchCard'
import { IconFont } from '@/components/atoms/IconFont'

const PAIRS_PER_PAGE = 4

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function createPages(
  words: { id: number; word_en: string; translation_ru: string }[],
  pairsPerPage: number
) {
  const result: { en: typeof words; ru: typeof words }[] = []
  for (let i = 0; i < words.length; i += pairsPerPage) {
    const chunk = words.slice(i, i + pairsPerPage)
    result.push({ en: chunk, ru: shuffleArray(chunk) })
  }
  return result
}

type WordType = { id: number; word_en: string; translation_ru: string }
type PageType = { en: WordType[]; ru: WordType[] }

export const WordsMatchingPage = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>()
  const navigate = useNavigate()
  const { finishSession, isCompleting } = useFinishSession()
  const { words, isLoading, error } = useWords(Number(subtopicId))
  useActivityHeartbeat()
  const [selectedEn, setSelectedEn] = useState<number | null>(null)
  const [selectedRu, setSelectedRu] = useState<number | null>(null)
  const [matched, setMatched] = useState<
    { en: number; ru: number; wordEn: string; wordRu: string }[]
  >([])
  const [wrongPair, setWrongPair] = useState<{ en: number; ru: number } | null>(null)
  const [page, setPage] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [gemsEarned, setGemsEarned] = useState(0)
  const [pages, setPages] = useState<PageType[]>([])
  const pagesInitializedRef = useRef(false)

  useEffect(() => {
    if (words && words.length > 0 && !pagesInitializedRef.current) {
      pagesInitializedRef.current = true
      const newPages = createPages(words, PAIRS_PER_PAGE)
      queueMicrotask(() => setPages(newPages))
    }
  }, [words])

  const currentPage = pages[page]
  const matchedIds = matched.map((m) => m.en)
  const matchedRuIds = matched.map((m) => m.ru)

  const checkMatch = useCallback(
    (enId: number, ruId: number) => {
      if (!currentPage) return

      const enWord = currentPage.en.find((w) => w.id === enId)
      const ruWord = currentPage.ru.find((w) => w.id === ruId)

      if (enWord && ruWord) {
        if (enWord.translation_ru === ruWord.translation_ru) {
          setMatched((prev) => [
            ...prev,
            { en: enWord.id, ru: ruWord.id, wordEn: enWord.word_en, wordRu: ruWord.translation_ru },
          ])
          setSelectedEn(null)
          setSelectedRu(null)
          setWrongPair(null)
        } else {
          setWrongPair({ en: enWord.id, ru: ruWord.id })
          setTimeout(() => {
            setSelectedEn(null)
            setSelectedRu(null)
            setWrongPair(null)
          }, 900)
        }
      }
    },
    [currentPage]
  )

  const handleSelect = useCallback(
    (type: 'en' | 'ru', id: number) => {
      if (wrongPair) return

      if (type === 'en') {
        setSelectedEn(id)
        if (selectedRu !== null) {
          checkMatch(id, selectedRu)
        }
      } else {
        setSelectedRu(id)
        if (selectedEn !== null) {
          checkMatch(selectedEn, id)
        }
      }
    },
    [wrongPair, selectedEn, selectedRu, checkMatch]
  )

  const isPageComplete =
    currentPage &&
    matched.filter((m) => currentPage.en.some((w) => w.id === m.en)).length >= currentPage.en.length
  const isAllComplete = words && words.length > 0 && matched.length === words.length

  useEffect(() => {
    if (isPageComplete && !isAllComplete && pages.length > page + 1) {
      const timer = setTimeout(() => setPage((p) => p + 1), 700)
      return () => clearTimeout(timer)
    }
  }, [isPageComplete, isAllComplete, page, pages.length])

  useEffect(() => {
    if (isAllComplete && !showReward && !isCompleting) {
      const complete = async () => {
        try {
          const result = await finishSession(Number(subtopicId), 'matching')
          setGemsEarned(result.gemsEarned)
        } catch (e) {
          console.error('Failed to complete session:', e)
        }
        setShowReward(true)
      }
      complete()
    }
  }, [isAllComplete, showReward, isCompleting, subtopicId, finishSession])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleCollect = useCallback(() => {
    setShowReward(false)
    sessionStorage.setItem('sessionCompleted', 'true')
    navigate(-1)
  }, [navigate])

  if (isLoading) return <div className={styles.container}>Loading...</div>
  if (error) return <div className={styles.container}>Error: {error}</div>
  if (!words || words.length === 0) return <div className={styles.container}>No words found</div>
  if (!currentPage) return <div className={styles.container}>Loading...</div>

  const progress = (matched.length / words.length) * 100

  const sortedEnCards = [...currentPage.en].sort((a, b) => {
    const aMatched = matchedIds.includes(a.id)
    const bMatched = matchedIds.includes(b.id)
    if (aMatched && !bMatched) return 1
    if (!aMatched && bMatched) return -1
    return 0
  })

  const sortedRuCards = [...currentPage.ru].sort((a, b) => {
    const aMatched = matchedRuIds.includes(a.id)
    const bMatched = matchedRuIds.includes(b.id)
    if (aMatched && !bMatched) return 1
    if (!aMatched && bMatched) return -1
    return 0
  })

  const matchedOnPageCount = matched.filter((m) => currentPage.en.some((w) => w.id === m.en)).length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack} aria-label="Go back">
          <IconFont name="arrow-back" size={20} />
        </button>
        <ProgressBar value={progress} className={styles.progressBar} color="purple" />
      </div>
      <div className={styles.heading}>
        <h2 className={styles.title}>Match the words with translations</h2>
        <p className={styles.matchedAmount}>
          {matchedOnPageCount}/{currentPage.en.length} matched
        </p>
      </div>

      <div className={styles.matchingBoard}>
        <div className={styles.column}>
          {sortedEnCards.map((w) => {
            const isMatched = matchedIds.includes(w.id)
            const isWrong = wrongPair?.en === w.id
            const isSelected = selectedEn === w.id && !isMatched

            let state: 'default' | 'correct' | 'incorrect' | 'selected' = 'default'
            if (isMatched) state = 'correct'
            else if (isWrong) state = 'incorrect'
            else if (isSelected) state = 'selected'

            return (
              <MatchCard
                key={w.id}
                state={state}
                disabled={isMatched}
                onClick={() => !isMatched && handleSelect('en', w.id)}
              >
                {w.word_en}
              </MatchCard>
            )
          })}
        </div>
        <div className={styles.column}>
          {sortedRuCards.map((w) => {
            const isMatched = matchedRuIds.includes(w.id)
            const isWrong = wrongPair?.ru === w.id
            const isSelected = selectedRu === w.id && !isMatched

            let state: 'default' | 'correct' | 'incorrect' | 'selected' = 'default'
            if (isMatched) state = 'correct'
            else if (isWrong) state = 'incorrect'
            else if (isSelected) state = 'selected'

            return (
              <MatchCard
                key={w.id}
                state={state}
                disabled={isMatched}
                onClick={() => !isMatched && handleSelect('ru', w.id)}
              >
                {w.translation_ru}
              </MatchCard>
            )
          })}
        </div>
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
