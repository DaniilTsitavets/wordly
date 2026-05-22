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
import { FillingGapsPage } from '@/components/organisms/Pages/FillingGapsPage/FillingGapsPage'
import { RecallMechanicPage } from '@/components/organisms/Pages/RecallMechanicPage/RecallMechanicPage'

export type RouteAccess = 'public' | 'protected' | 'game'

interface IRoute {
  path: string
  element: JSX.Element
  access: RouteAccess
}

export const routesConfig: IRoute[] = [
  {
    path: '/',
    element: <TopicPage />,
    access: 'public',
  },
  {
    path: '/onboarding/daily-goal',
    element: <OnboardingPage />,
    access: 'public',
  },
  {
    path: '/:topic/:subtopic/:subtopicId',
    element: <SubTopicPage />,
    access: 'public',
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    access: 'protected',
  },
  {
    path: '/vocabulary',
    element: <VocabularyPage />,
    access: 'protected',
  },
  {
    path: '/recall',
    element: <RecallPage />,
    access: 'protected',
  },
  {
    path: '/recall/practice',
    element: <RecallMechanicPage />,
    access: 'protected',
  },
  {
    path: '/subtopics/:subtopicId/matching',
    element: <WordsMatchingPage />,
    access: 'game',
  },
  {
    path: '/subtopics/:subtopicId/flashcards',
    element: <FlashCardsPage />,
    access: 'game',
  },
  {
    path: '/subtopics/:subtopicId/mnemonic-cards',
    element: <MnemonicCardsPage />,
    access: 'game',
  },
  {
    path: '/subtopics/:subtopicId/word-builder',
    element: <WordBuilderPage />,
    access: 'game',
  },
  {
    path: '/subtopics/:subtopicId/filling-gaps',
    element: <FillingGapsPage />,
    access: 'game',
  },
]

export type { IRoute }
