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
    description: 'Learn new words with our interactive flashcards.',
    icon: 'tick3',
  },
  matching: {
    label: 'Matching pairs',
    description: 'Connect words with their translations in a fun memory game.',
    icon: 'puzzle',
  },
  filling_gaps: {
    label: 'Filling gaps',
    description: 'Test your memory by filling in missing letters in words.',
    icon: 'target',
  },
  word_builder: {
    label: 'Word building',
    description: 'Construct words from shuffled letters to reinforce spelling.',
    icon: 'hierarchy',
  },
}
