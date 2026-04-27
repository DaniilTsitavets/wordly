import { Card } from '@/components/molecules/Card/Card'
import testImg from '@/assets/test_img/test_img2.jpg'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import styles from './FlashCardsPage.module.scss'

export const FlashCardsPage = () => {
  return (
    <>
    <section className={styles.container}>
      <ProgressBar value={60}  />
    <p>Card 1 of 4</p>
      <Card
        wordEn="Hello"
        transcriptionEn="hə'ləʊ"
        translationRu="Привет"
        imageUrl={testImg}
        hasMnemonic={false}
        usageExampleEn="Hello, how are you?"
        usageExampleRu="Привет, как дела?"
      />

      <Button size="md" variant='gradient'>Next <IconFont name="arrow-right" size={14} /></Button>
    </section>
    

    </>
  )
}
