import type { MechanicType } from '@/api/topics'

interface MechanicInfo {
  label: string
  description: string
  icon: string
}

export const MECHANIC_INFO: Record<MechanicType, MechanicInfo> = {
  mnemonic_cards: {
    label: 'Mnemonics',
    description:
      'The foundation of memory. Visualize words using our precision-engineered mnemonic deck.',
    icon: 'brain',
  },
  flashcards: {
    label: 'Flashcards',
    description: 'Spaced-repetition drills for active recall.',
    icon: 'tick3',
  },
  matching: {
    label: 'Matching pairs',
    description: 'Connect words with their conceptual visual markers.',
    icon: 'puzzle',
  },
  filling_gaps: {
    label: 'Audio recognition',
    description: 'Master the phonetics and pronunciation flow.',
    icon: 'target',
  },
  word_builder: {
    label: 'Sentence building',
    description: 'Apply vocabulary in complex grammatical contexts.',
    icon: 'hierarchy',
  },
}
