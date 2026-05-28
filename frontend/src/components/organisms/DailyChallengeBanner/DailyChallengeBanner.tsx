import styles from './DailyChallengeBanner.module.scss'
import { useNavigate } from 'react-router-dom'

export const DailyChallengeBanner = () => {
  const navigate = useNavigate()

  const handlePlayClick = () => {
    navigate('/daily-challenge')
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.banner} role="region" aria-label="Daily Challenge">
        <div className={styles.content}>
          <div className={styles.label}>
            <span className={styles.calendarIcon}>📅</span>
            Daily Challenge
          </div>
          <h2 className={styles.title}>Idiom Master Challenge</h2>
          <p className={styles.subtitle}>
            Test your knowledge! Match English idioms with their Russian meanings. New challenge
            every day!
          </p>
          <div className={styles.stats}>
            <span className={styles.statItem}>
              <span className={styles.statIcon}>🕹️</span>5 Idioms
            </span>
            <span className={styles.statItem}>
              <span className={styles.statIcon}>⏱</span>
              2–3 min
            </span>
            <span className={styles.statItem}>
              <span className={styles.statIcon}>⭐</span>
              No login required
            </span>
          </div>
        </div>

        <button type="button" className={styles.playBtn} onClick={handlePlayClick}>
          Play Now →
        </button>
      </div>
    </div>
  )
}
