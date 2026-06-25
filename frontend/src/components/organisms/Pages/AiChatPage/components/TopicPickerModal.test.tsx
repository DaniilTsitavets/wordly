import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { TopicPickerModal } from './TopicPickerModal'
import type { PickedSubtopic } from './TopicPickerModal'

const url = (path: string) => `${API_BASE_URL}${path}`

const sampleTopic = {
  id: 7,
  name: 'Food',
  description: 'Food vocabulary',
  image_url: '',
  sort_order: 1,
  subtopics_total: 2,
  subtopics_completed: 0,
}

const sampleSubtopic = {
  id: 42,
  name: 'Fruits',
  description: 'Fruit names',
  image_url: '',
  sort_order: 1,
  words_count: 10,
  disabled_mechanics: [],
  status: 'unblocked' as const,
  completed_mechanics_count: 0,
  total_mechanics_count: 5,
}

describe('TopicPickerModal', () => {
  it('does not fetch or render anything when closed', () => {
    const fetchSpy = vi.fn()
    server.use(http.get(url('/topics'), fetchSpy))
    renderWithProviders(<TopicPickerModal isOpen={false} onClose={() => {}} onPick={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('shows an error message when topics fetch fails', async () => {
    server.use(
      http.get(url('/topics'), () =>
        HttpResponse.json({ message: 'topics broken' }, { status: 500 })
      )
    )
    renderWithProviders(<TopicPickerModal isOpen onClose={() => {}} onPick={() => {}} />)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/topics broken|HTTP 500/)
    )
  })

  it('renders empty state when there are no topics', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [] })))
    renderWithProviders(<TopicPickerModal isOpen onClose={() => {}} onPick={() => {}} />)
    await waitFor(() => expect(screen.getByText(/No topics available/i)).toBeInTheDocument())
  })

  it('walks topic → subtopic and calls onPick with the picked tuple', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })),
      http.get(url('/topics/7'), () => HttpResponse.json({ subtopic_ids: [42] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([sampleSubtopic]))
    )

    const onPick = vi.fn()
    renderWithProviders(<TopicPickerModal isOpen onClose={() => {}} onPick={onPick} />)

    await userEvent.click(await screen.findByRole('button', { name: /Food/ }))
    await userEvent.click(await screen.findByRole('button', { name: /Fruits/ }))

    expect(onPick).toHaveBeenCalledWith<[PickedSubtopic]>({
      subtopicId: 42,
      subtopicName: 'Fruits',
      topicName: 'Food',
    })
  })

  it('shows an error in step 2 when subtopics fetch fails', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })),
      http.get(url('/topics/7'), () =>
        HttpResponse.json({ message: 'subtopics broken' }, { status: 500 })
      )
    )
    renderWithProviders(<TopicPickerModal isOpen onClose={() => {}} onPick={() => {}} />)

    await userEvent.click(await screen.findByRole('button', { name: /Food/ }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/subtopics broken|HTTP 500/)
    )
  })

  it('shows empty state in step 2 when the topic has no subtopics', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })),
      http.get(url('/topics/7'), () => HttpResponse.json({ subtopic_ids: [] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([]))
    )
    renderWithProviders(<TopicPickerModal isOpen onClose={() => {}} onPick={() => {}} />)

    await userEvent.click(await screen.findByRole('button', { name: /Food/ }))
    await waitFor(() => expect(screen.getByText(/No subtopics available/i)).toBeInTheDocument())
  })

  it('back button returns to the topic list', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })),
      http.get(url('/topics/7'), () => HttpResponse.json({ subtopic_ids: [42] })),
      http.post(url('/subtopics/batch'), () => HttpResponse.json([sampleSubtopic]))
    )
    renderWithProviders(<TopicPickerModal isOpen onClose={() => {}} onPick={() => {}} />)

    await userEvent.click(await screen.findByRole('button', { name: /Food/ }))
    await screen.findByRole('button', { name: /Fruits/ })

    await userEvent.click(screen.getByRole('button', { name: /Back to topics/i }))
    // We're back on step 1 — topic button is visible again.
    expect(await screen.findByRole('button', { name: /Food/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Fruits/ })).not.toBeInTheDocument()
  })

  it('singular "word" label when subtopic has exactly one word', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })),
      http.get(url('/topics/7'), () => HttpResponse.json({ subtopic_ids: [42] })),
      http.post(url('/subtopics/batch'), () =>
        HttpResponse.json([{ ...sampleSubtopic, words_count: 1 }])
      )
    )
    renderWithProviders(<TopicPickerModal isOpen onClose={() => {}} onPick={() => {}} />)
    await userEvent.click(await screen.findByRole('button', { name: /Food/ }))
    await waitFor(() => expect(screen.getByText('1 word')).toBeInTheDocument())
  })

  it('required mode blocks Escape and hides the close button', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })))
    const onClose = vi.fn()
    renderWithProviders(<TopicPickerModal isOpen required onClose={onClose} onPick={() => {}} />)
    expect(screen.queryByRole('button', { name: /Закрыть/i })).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('non-required mode shows the close button and forwards Escape', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })))
    const onClose = vi.fn()
    renderWithProviders(<TopicPickerModal isOpen onClose={onClose} onPick={() => {}} />)
    expect(screen.getByRole('button', { name: /Закрыть/i })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
