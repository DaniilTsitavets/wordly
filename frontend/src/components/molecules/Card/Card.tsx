import { IconFont } from '@/components/atoms/IconFont'
import styles from './Card.module.scss'

export interface WordCardProps {
  id?: number
  wordEn: string
  transcriptionEn: string
  translationRu: string
  imageUrl: string
  hasMnemonic: boolean
  mnemonicText?: string
  usageExampleEn?: string
  usageExampleRu?: string
  onPlayAudio?: () => void
  isFlipped?: boolean
  onFlip?: () => void
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
  isFlipped = false,
  onFlip,
}: WordCardProps) {
  const displayedMnemonic =
    hasMnemonic && mnemonicText ? mnemonicText : hasMnemonic ? 'Представь себе…' : null

  const innerClassName = [styles.cardInner, isFlipped ? styles['cardInner--flipped'] : '']
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={styles.card}
      aria-label={`Word card: ${wordEn}`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFlip?.()
        }
      }}
    >
      <div className={innerClassName}>
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
      </div>
    </section>
  )
}
