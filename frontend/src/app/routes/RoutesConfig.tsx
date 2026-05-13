import type { JSX } from 'react'
import { TopicPage } from '@/components/organisms/Pages/TopicPage'
import { SubTopicPage } from '@/components/organisms/Pages/SubTopicPage/SubTopicPage'
import { OnboardingPage } from '@/components/organisms/Pages/OnboardingPage'
import { ProfilePage } from '@/components/organisms/Pages/ProfilePage'
import { VocabularyPage } from '@/components/organisms/Pages/VocabularyPage'
import { RecallPage } from '@/components/organisms/Pages/RecallPage'
import { FlashCardsPage } from '@/components/organisms/Pages/FlashCardsPage'
import { MnemonicCardsPage } from '@/components/organisms/Pages/MnemonicCardsPage'
import { WordsMatchingPage } from '@/components/organisms/Pages/WordsMatchingPage/WordsMatchingPage'
import { WordBuilderPage } from '@/components/organisms/Pages/WordBuilderPage/WordBuilderPage'

interface IRoute {
  path: string
  element: JSX.Element
  isProtected?: boolean
}

export const routesConfig: IRoute[] = [
  {
    path: '/',
    element: <TopicPage />,
    isProtected: false,
  },
  {
    path: '/onboarding/daily-goal',
    element: <OnboardingPage />,
    isProtected: false,
  },
  {
    path: '/:topic/:subtopic/:subtopicId',
    element: <SubTopicPage />,
    isProtected: false,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    isProtected: false,
  },
  {
    path: '/vocabulary',
    element: <VocabularyPage />,
    isProtected: false,
  },
  {
    path: '/recall',
    element: <RecallPage />,
    isProtected: false,
  },
  {
    path: '/subtopics/:subtopicId/matching',
    element: <WordsMatchingPage />,
    isProtected: false,
  },
  {
    path: '/subtopics/:subtopicId/flashcards',
    element: <FlashCardsPage />,
    isProtected: false,
  },
  {
    path: '/subtopics/:subtopicId/mnemonic-cards',
    element: <MnemonicCardsPage />,
    isProtected: false,
  },
  {
    path: '/subtopics/:subtopicId/word-builder',
    element: <WordBuilderPage />,
    isProtected: false,
  },
]

export type { IRoute }
