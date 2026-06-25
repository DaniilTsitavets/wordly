import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { VocabularyPage } from './VocabularyPage'

const url = (path: string) => `${API_BASE_URL}${path}`

const topicsResponse = {
  topics: [
    {
      id: 1,
      name: 'Food & Drinks',
      description: '',
      image_url: '',
      sort_order: 1,
      subtopics_total: 2,
      subtopics_completed: 0,
    },
    {
      id: 2,
      name: 'Numbers',
      description: '',
      image_url: '',
      sort_order: 2,
      subtopics_total: 1,
      subtopics_completed: 0,
    },
  ],
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

const word = {
  id: 1,
  topic_id: 1,
  word_en: 'apple',
  transcription_en: 'ˈæpəl',
  translation_ru: 'яблоко',
  image_url: '',
  status: 'learning' as const,
  next_recall: null,
}

describe('VocabularyPage', () => {
  it('shows the spinner while loading', () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () => new Promise(() => {}))
    )
    const { container } = renderWithProviders(<VocabularyPage />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders error', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    )
    renderWithProviders(<VocabularyPage />)
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument())
  })

  it('renders total + word list', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () =>
        HttpResponse.json({ total: 2, page: 1, words: [word, { ...word, id: 2, word_en: 'pear' }] })
      )
    )
    renderWithProviders(<VocabularyPage />)
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument())
    expect(screen.getByText('pear')).toBeInTheDocument()
    expect(screen.getByText(/You've learned 2 words so far/)).toBeInTheDocument()
  })

  it('back button navigates to /', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () => HttpResponse.json({ total: 0, page: 1, words: [] }))
    )

    renderWithProviders(
      <Routes>
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: '/vocabulary' }
    )

    await waitFor(() => expect(screen.getByText(/Total Words Learned/)).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Go back'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/')
  })

  it('formats Review badge for future recall', async () => {
    const future = new Date()
    future.setDate(future.getDate() + 3)
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () =>
        HttpResponse.json({
          total: 1,
          page: 1,
          words: [{ ...word, next_recall: future.toISOString() }],
        })
      )
    )
    renderWithProviders(<VocabularyPage />)
    await waitFor(() => expect(screen.getByText(/Review in 3d/)).toBeInTheDocument())
  })

  it('formats Review as "now" for past recall', async () => {
    const past = new Date()
    past.setDate(past.getDate() - 1)
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), () =>
        HttpResponse.json({
          total: 1,
          page: 1,
          words: [{ ...word, next_recall: past.toISOString() }],
        })
      )
    )
    renderWithProviders(<VocabularyPage />)
    await waitFor(() => expect(screen.getByText(/Review now/)).toBeInTheDocument())
  })

  it('shows topic filter pills and filters by topic', async () => {
    const wordNumbers = { ...word, id: 3, topic_id: 2, word_en: 'one' }
    server.use(
      http.get(url('/topics'), () => HttpResponse.json(topicsResponse)),
      http.get(url('/vocabulary'), ({ request }) => {
        const topicId = new URL(request.url).searchParams.get('topic_id')
        if (topicId === '2') {
          return HttpResponse.json({ total: 1, page: 1, words: [wordNumbers] })
        }
        return HttpResponse.json({
          total: 3,
          page: 1,
          words: [word, { ...word, id: 2, word_en: 'pear' }, wordNumbers],
        })
      })
    )
    renderWithProviders(<VocabularyPage />)

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /topic/i })).toBeInTheDocument()
    )
    expect(screen.getByText('apple')).toBeInTheDocument()
    // both topics are available since initial vocab has words from topics 1 and 2
    expect(screen.getByRole('option', { name: 'Food & Drinks' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Numbers' })).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByRole('combobox', { name: /topic/i }), 'Numbers')
    await waitFor(() => expect(screen.getByText('one')).toBeInTheDocument())
    expect(screen.queryByText('apple')).not.toBeInTheDocument()
  })
})
