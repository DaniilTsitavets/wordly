import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDailyGame, submitDailyGameAnswer } from '@/api/dailyGame'
import type { DailyGameData } from '@/api/dailyGame'
import { Spinner } from '@/components/atoms/Spinner'
import { DailyChallengeResultModal } from '@/components/molecules/DailyChallengeResultModal/DailyChallengeResultModal'
import styles from './DailyChallengePage.module.scss'

type Phase = 'loading' | 'error' | 'playing' | 'answered' | 'result'

interface AnsweredState {
  selectedOption: number
  isCorrect: boolean
  correctOption: number
}

export function DailyChallengePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [game, setGame] = useState<DailyGameData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [answered, setAnswered] = useState<AnsweredState | null>(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    getDailyGame()
      .then((data) => {
        setGame(data)
        setPhase('playing')
      })
      .catch((err: Error) => {
        setErrorMsg(err.message)
        setPhase('error')
      })
  }, [])

  const handleSelect = async (optionIndex: number) => {
    if (!game || phase !== 'playing') return
    try {
      const result = await submitDailyGameAnswer(game.id, optionIndex)
      setAnswered({
        selectedOption: optionIndex,
        isCorrect: result.is_correct,
        correctOption: result.correct_option,
      })
      if (result.is_correct) setScore((s) => s + 1)
      setPhase('answered')
    } catch {
      const isCorrect = optionIndex === game.correct_option
      setAnswered({
        selectedOption: optionIndex,
        isCorrect,
        correctOption: game.correct_option,
      })
      if (isCorrect) setScore((s) => s + 1)
      setPhase('answered')
    }
  }

  const total = 1

  if (phase === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <Spinner />
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>{errorMsg || 'No daily game available today.'}</div>
      </div>
    )
  }

  const progressPct = phase === 'answered' ? 100 : 0

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.tag}>🏆 Daily Challenge</span>
        <h1 className={styles.title}>Idiom Master</h1>
        <p className={styles.subtitle}>Match English idioms with their Russian meanings</p>
      </div>

      {/* Progress */}
      <div className={styles.progressSection}>
        <div className={styles.progressMeta}>
          <span>Question 1 of {total}</span>
          <span>
            Score: {score}/{total}
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Question card */}
      {game && (
        <div className={styles.card}>
          <p className={styles.idiom}>&quot;{game.idiom}&quot;</p>
          <p className={styles.question}>What does this idiom mean?</p>

          <div className={styles.options}>
            {game.options.map((opt, i) => {
              const optNum = i + 1
              let cls = styles.option
              if (answered) {
                if (optNum === answered.correctOption)
                  cls = `${styles.option} ${styles.optionCorrect}`
                else if (optNum === answered.selectedOption && !answered.isCorrect)
                  cls = `${styles.option} ${styles.optionWrong}`
              }
              return (
                <button
                  key={optNum}
                  type="button"
                  className={cls}
                  disabled={!!answered}
                  onClick={() => handleSelect(optNum)}
                >
                  {opt}
                  {answered && optNum === answered.correctOption && (
                    <span className={styles.optionIcon}>✓</span>
                  )}
                  {answered && optNum === answered.selectedOption && !answered.isCorrect && (
                    <span className={styles.optionIcon}>✕</span>
                  )}
                </button>
              )
            })}
          </div>

          {answered && (
            <>
              {answered.isCorrect ? (
                <div className={styles.feedbackCorrect}>
                  <span className={styles.feedbackIcon}>✅</span>
                  <div>
                    <strong>Correct!</strong>
                    The correct answer is &quot;{game.options[answered.correctOption - 1]}&quot;.
                  </div>
                </div>
              ) : (
                <div className={styles.feedbackWrong}>
                  <span className={styles.feedbackIcon}>💡</span>
                  <div>
                    <strong>Not quite!</strong>
                    The correct answer was &quot;{game.options[answered.correctOption - 1]}&quot;.
                  </div>
                </div>
              )}
              <button type="button" className={styles.nextBtn} onClick={() => setPhase('result')}>
                See Results →
              </button>
            </>
          )}
        </div>
      )}

      {/* Result modal */}
      {phase === 'result' && game && answered && (
        <DailyChallengeResultModal
          score={score}
          total={total}
          idioms={[{ idiom: game.idiom, translation: game.options[answered.correctOption - 1] }]}
          isCorrect={answered.isCorrect}
          onGoHome={() => navigate('/')}
          onOverlayClick={() => navigate('/')}
        />
      )}
    </div>
  )
}
