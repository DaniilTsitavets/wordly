import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { HomeTopicRow } from './HomeTopicRow'

const url = (path: string) => `${API_BASE_URL}${path}`

const subtopic = {
  id: 10,
  name: 'Drinks',
  description: 'd',
  image_url: 'http://img/d.png',
  sort_order: 1,
  words_count: 5,
  disabled_mechanics: [],
  status: 'unblocked' as const,
  completed_mechanics_count: 0,
  total_mechanics_count: 5,
}

describe('HomeTopicRow', () => {
  it('shows the loading state while fetching', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [10] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([subtopic]))
    )

    renderWithProviders(<HomeTopicRow topicId={1} topicTitle="Food" topicDescription="About" />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading subtopics…')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Drinks' })).toBeInTheDocument())
  })

  it('renders the title and description headers', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([]))
    )

    renderWithProviders(<HomeTopicRow topicId={1} topicTitle="Food" topicDescription="About" />)

    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders subtopics with lockMode="auto" honoring API status', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [10, 11] })),
      http.post(url('/subtopics/batch'), () =>
        HttpResponse.json([subtopic, { ...subtopic, id: 11, name: 'Desserts', status: 'locked' }])
      )
    )

    renderWithProviders(<HomeTopicRow topicId={1} topicTitle="Food" topicDescription="About" />)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Drinks' })).toBeInTheDocument())

    expect(screen.getByRole('button', { name: /Start Learning/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Locked/ })).toBeDisabled()
  })

  it('locks ALL cards when lockMode="all-locked"', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [10, 11] })),
      http.post(url('/subtopics/batch'), () =>
        HttpResponse.json([subtopic, { ...subtopic, id: 11, name: 'Desserts' }])
      )
    )

    renderWithProviders(
      <HomeTopicRow topicId={1} topicTitle="Food" topicDescription="x" lockMode="all-locked" />
    )

    await waitFor(() => expect(screen.queryAllByRole('button', { name: /Locked/ })).toHaveLength(2))
    expect(screen.queryAllByRole('button', { name: /Start Learning/ })).toHaveLength(0)
  })

  it('locks all-but-first when lockMode="first-only"', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [10, 11, 12] })),
      http.post(url('/subtopics/batch'), () =>
        HttpResponse.json([
          subtopic,
          { ...subtopic, id: 11, name: 'B' },
          { ...subtopic, id: 12, name: 'C' },
        ])
      )
    )

    renderWithProviders(
      <HomeTopicRow topicId={1} topicTitle="Food" topicDescription="x" lockMode="first-only" />
    )

    await waitFor(() => expect(screen.getAllByRole('button', { name: /Locked/ })).toHaveLength(2))
    expect(screen.getAllByRole('button', { name: /Start Learning/ })).toHaveLength(1)
  })

  it('renders an error message when the fetch fails', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ message: 'no topic' }, { status: 404 }))
    )

    renderWithProviders(<HomeTopicRow topicId={1} topicTitle="Food" topicDescription="x" />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('no topic'))
  })
})
