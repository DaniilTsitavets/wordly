import type { JSX } from 'react'
import { TopicPage } from '@/components/organisms/Pages/TopicPage'
import { SubTopicPage } from '@/components/organisms/Pages/SubTopicPage/SubTopicPage'

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
    path: '/:topic/:subtopic/:subtopicId',
    element: <SubTopicPage />,
    isProtected: false,
  }
]

export type { IRoute }
