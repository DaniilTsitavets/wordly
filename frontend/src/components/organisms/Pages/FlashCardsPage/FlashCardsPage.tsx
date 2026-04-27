import { Card } from '@/components/molecules/Card/Card'
import testImg from '@/assets/test_img/test_img2.jpg'

export const FlashCardsPage = () => {
  return (
    <>
      <Card
        wordEn="Hello"
        transcriptionEn="hə'ləʊ"
        translationRu="Привет"
        imageUrl={testImg}
        hasMnemonic={false}
        usageExampleEn="Hello, how are you?"
        usageExampleRu="Привет, как дела?"
      />

      <Card
        wordEn="Ship"
        transcriptionEn="ʃɪp"
        translationRu="Корабль"
        imageUrl={testImg}
        hasMnemonic={true}
        mnemonicText="Представь себе корабль с шипами"
        usageExampleEn="The ship is heading to London."
        usageExampleRu="Корабль направляется в Лондон."
      />
    </>
  )
}
