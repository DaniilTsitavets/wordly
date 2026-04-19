import type { JSX } from 'react'
import { TopicPage } from '@/components/organisms/Pages/TopicPage'

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
]

export type { IRoute }
