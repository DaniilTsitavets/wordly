import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { AdminWords } from './AdminWords'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic = {
  id: 1,
  name: 'Food',
  description: null,
  image_url: null,
  sort_order: null,
  subtopics_count: 1,
}
const subtopic = {
  id: 10,
  topic_id: 1,
  name: 'Drinks',
  description: null,
  image_url: null,
  sort_order: 1,
  words_count: 1,
  disabled_mechanics: [],
}
const word = {
  id: 100,
  subtopic_id: 10,
  word_en: 'tea',
  transcription_en: '',
  translation_ru: 'чай',
  image_url: '',
  usage_example_en: null,
  usage_example_en_translation_ru: null,
  mnemonic_image_url: null,
  mnemo_text: null,
}

describe('AdminWords', () => {
  it('loads filters and shows words after both selects are picked', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([subtopic])),
      http.get(url('/admin/words'), () => HttpResponse.json([word]))
    )
    renderWithProviders(<AdminWords />)
    await waitFor(() => expect(screen.getByText('tea')).toBeInTheDocument())
    expect(screen.getByText('чай')).toBeInTheDocument()
  })

  it('opens the New Word form', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([])),
      http.get(url('/admin/words'), () => HttpResponse.json([]))
    )
    renderWithProviders(<AdminWords />)
    await userEvent.click(screen.getByRole('button', { name: /Add New Word/ }))
    expect(screen.getByRole('heading', { name: 'New Word' })).toBeInTheDocument()
  })

  it('opens the delete modal for a word (uses English as item name)', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([subtopic])),
      http.get(url('/admin/words'), () => HttpResponse.json([word]))
    )
    renderWithProviders(<AdminWords />)
    await waitFor(() => expect(screen.getByText('tea')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/Delete "tea"\?/)).toBeInTheDocument()
  })

  it('opens Edit form for a word', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([subtopic])),
      http.get(url('/admin/words'), () => HttpResponse.json([word]))
    )
    renderWithProviders(<AdminWords />)
    await waitFor(() => expect(screen.getByText('tea')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit Word' })).toBeInTheDocument()
  })
})
