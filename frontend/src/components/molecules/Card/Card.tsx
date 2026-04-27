import { useState, useCallback } from 'react'
import { IconFont } from '@/components/atoms/IconFont'
import styles from './Card.module.scss'

export interface WordCardProps {
  /** Unique word id */
  id?: number
  /** English word */
  wordEn: string
  /** IPA transcription */
  transcriptionEn: string
  /** Russian translation */
  translationRu: string
  /** URL for the word illustration */
  imageUrl: string
  /** Whether a sound mnemonic is available */
  hasMnemonic: boolean
  /** Optional mnemonic text (from API in the future) */
  mnemonicText?: string
  /** Usage example in English */
  usageExampleEn?: string
  /** Usage example translation in Russian */
  usageExampleRu?: string
  /** Callback when the audio icon is pressed */
  onPlayAudio?: () => void
}

export function Card({
  wordEn,
  transcriptionEn,
  translationRu,
  imageUrl,
  hasMnemonic,
  mnemonicText,
  usageExampleEn,
  usageExampleRu,
  onPlayAudio,
}: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const displayedMnemonic =
    hasMnemonic && mnemonicText ? mnemonicText : hasMnemonic ? 'Представь себе…' : null

  return (
    <section
      className={`${styles.card} ${isFlipped ? styles['card--flipped'] : ''}`}
      aria-label={`Word card: ${wordEn}`}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleFlip()
        }
      }}
    >
      <div className={styles.face} aria-hidden={isFlipped}>
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={imageUrl}
            alt={`Illustration for "${wordEn}"`}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className={styles.body}>
          <h3 className={styles.word}>{wordEn}</h3>

          <div className={styles.pronunciation}>
            <button
              className={styles.audioButton}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onPlayAudio?.()
              }}
              aria-label={`Play pronunciation of ${wordEn}`}
            >
              <IconFont name="player" size="1.25rem" decorative />
            </button>
            <span className={styles.transcription}>|{transcriptionEn}|</span>
          </div>

          {displayedMnemonic && <p className={styles.mnemonic}>{displayedMnemonic}</p>}

          <p className={styles.flipHint}>Click to reveal translation</p>
        </div>
      </div>

      <div className={`${styles.face} ${styles.faceBack}`} aria-hidden={!isFlipped}>
        <div className={styles.body}>
          <h3 className={styles.translationWord}>{translationRu}</h3>
          <p className={styles.backWordEn}>{wordEn}</p>

          {(usageExampleEn || usageExampleRu) && (
            <div
              className={`${styles.exampleBlock} ${hasMnemonic ? styles['exampleBlock--mnemonic'] : styles['exampleBlock--default']}`}
            >
              {usageExampleEn && <p className={styles.exampleEn}>{usageExampleEn}</p>}
              {usageExampleRu && <p className={styles.exampleRu}>{usageExampleRu}</p>}
            </div>
          )}

          <p className={styles.flipHint}>Click to flip back</p>
        </div>
      </div>
    </section>
  )
}
