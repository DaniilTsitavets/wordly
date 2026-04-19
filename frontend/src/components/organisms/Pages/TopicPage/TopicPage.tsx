import { SubtopicCard } from '@/components/molecules/SubtopicCard'

export function TopicPage() {
  return (
    <>
      <div>TopicPage</div>
      <SubtopicCard
        id={1}
        title="Subtopic 1"
        imageUrl="src/assets/test_img/pizza.png"
        description="Lorem ipsum dolor sit amet"
        wordCount={10}
        levels={[]}
      />
      <SubtopicCard
        id={2}
        title="Subtopic 2"
        imageUrl="src/assets/test_img/pizza.png"
        description="Lorem ipsum dolor sit amet"
        wordCount={10}
        levels={[]}
      />
    </>
  )
}
