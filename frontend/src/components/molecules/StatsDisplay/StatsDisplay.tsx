import { StatItem } from '../../atoms/StatItem'
import { IconFont } from '../../atoms/IconFont'
import styles from './StatsDisplay.module.scss'

export const StatsDisplay = () => {
  return (
    <div className={styles.wrapper} role="region" aria-label="Statistics">
      <StatItem
        icon={<IconFont name="trophey" size={32} color="#F0B100" />}
        value={120}
        label="Points"
      />
      <StatItem icon={<IconFont name="fire" size={32} />} value={7} label="Day Streak" />
      <StatItem icon={<IconFont name="book-colored" size={32} />} value={30} label="Words" />
    </div>
  )
}
