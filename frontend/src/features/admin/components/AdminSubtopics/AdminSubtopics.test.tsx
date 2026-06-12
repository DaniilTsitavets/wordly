import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { AdminSubtopics } from './AdminSubtopics'

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
  description: 'd',
  image_url: null,
  sort_order: 1,
  words_count: 5,
  disabled_mechanics: [],
}

describe('AdminSubtopics', () => {
  it('loads topics into the filter and shows subtopics for the first', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([subtopic]))
    )
    renderWithProviders(<AdminSubtopics />)
    await waitFor(() => expect(screen.getByText('Drinks')).toBeInTheDocument())
  })

  it('opens the New Subtopic form', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([]))
    )
    renderWithProviders(<AdminSubtopics />)
    await userEvent.click(screen.getByRole('button', { name: /Add New Subtopic/ }))
    expect(screen.getByRole('heading', { name: 'New Subtopic' })).toBeInTheDocument()
  })

  it('opens the delete modal for a subtopic', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([subtopic]))
    )
    renderWithProviders(<AdminSubtopics />)
    await waitFor(() => expect(screen.getByText('Drinks')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/Delete "Drinks"\?/)).toBeInTheDocument()
  })

  it('opens the Edit form prefilled', async () => {
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([subtopic]))
    )
    renderWithProviders(<AdminSubtopics />)
    await waitFor(() => expect(screen.getByText('Drinks')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit Subtopic' })).toBeInTheDocument()
  })
})
