import type { JSX } from 'react'
import { TopicPage } from '@/components/organisms/Pages/TopicPage'
import { SubTopicPage } from '@/components/organisms/Pages/SubTopicPage/SubTopicPage'
import { OnboardingPage } from '@/components/organisms/Pages/OnboardingPage'

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
]

export type { IRoute }
