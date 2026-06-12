import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { TopicSection } from './TopicSection'

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

describe('TopicSection', () => {
  it('renders title, description, and subtopic cards once loaded', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [10] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([subtopic]))
    )

    renderWithProviders(
      <TopicSection topicId={1} topicTitle="Food" topicDescription="About food" />
    )

    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('About food')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 3, name: 'Drinks' })).toBeInTheDocument()
    )
  })

  it('shows "No subtopics available" when batch is empty', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([]))
    )

    renderWithProviders(<TopicSection topicId={1} topicTitle="Food" topicDescription="x" />)

    await waitFor(() => expect(screen.getByText('No subtopics available.')).toBeInTheDocument())
  })

  it('renders the loading state initially', () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ subtopic_ids: [] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([]))
    )

    renderWithProviders(<TopicSection topicId={1} topicTitle="Food" topicDescription="x" />)

    expect(screen.getByText('Loading subtopics...')).toBeInTheDocument()
  })

  it('renders error from the API', async () => {
    server.use(
      http.get(url('/topics/1'), () => HttpResponse.json({ message: 'bad' }, { status: 500 }))
    )

    renderWithProviders(<TopicSection topicId={1} topicTitle="Food" topicDescription="x" />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('bad'))
  })
})
