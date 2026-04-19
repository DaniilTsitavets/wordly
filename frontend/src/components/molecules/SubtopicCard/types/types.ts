type MechanicType = 'mnemonic_card' | 'flashcard' | 'quiz' | 'matching'

type LevelStatus = 'locked' | 'in_progress' | 'completed'

interface APILevel {
  id: number
  title: string
  description: string
  mechanic_type: MechanicType
  status: LevelStatus
}

interface APISubtopic {
  id: number
  title: string
  image_url: string
  description: string
  word_count: number
  disabled_mechanics: MechanicType[]
  levels: APILevel[]
}

//Frontend models

interface ILevel {
  id: number
  mechanicType: MechanicType
  status: LevelStatus
  isDisabled: boolean
  isAvailable: boolean
}

interface ISubtopic {
  id: number
  title: string
  imageUrl: string
  description: string
  wordCount: number
  levels: ILevel[]
}

export type { MechanicType, LevelStatus, APILevel, APISubtopic, ILevel, ISubtopic }
