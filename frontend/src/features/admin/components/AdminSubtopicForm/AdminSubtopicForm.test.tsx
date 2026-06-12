import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { AdminSubtopicForm } from './AdminSubtopicForm'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic = {
  id: 1,
  name: 'Food',
  description: null,
  image_url: null,
  sort_order: null,
  subtopics_count: 1,
}

const existing = {
  id: 10,
  topic_id: 1,
  name: 'Drinks',
  description: 'd',
  image_url: null,
  sort_order: 1,
  words_count: 5,
  disabled_mechanics: [],
}

describe('AdminSubtopicForm', () => {
  it('renders New Subtopic and loads topics into the select', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    render(<AdminSubtopicForm onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'New Subtopic' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument())
  })

  it('renders Edit Subtopic with prefilled values', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    render(<AdminSubtopicForm onClose={() => {}} subtopic={existing} />)
    expect(screen.getByRole('heading', { name: 'Edit Subtopic' })).toBeInTheDocument()
    expect(screen.getByLabelText('Subtopic Name')).toHaveValue('Drinks')
  })

  it('flags name + topic_id when submitted empty', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([])))
    render(<AdminSubtopicForm onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /Create Subtopic/ }))
    expect(await screen.findByText('Subtopic name is required')).toBeInTheDocument()
    expect(screen.getByText('Topic reference is required')).toBeInTheDocument()
  })

  it('submits successfully when filled', async () => {
    const onSuccess = vi.fn()
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.post(url('/admin/subtopics'), () => HttpResponse.json(existing))
    )
    render(<AdminSubtopicForm onClose={() => {}} onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText('Subtopic Name'), 'New')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByLabelText('Topic Reference'), '1')
    await userEvent.click(screen.getByRole('button', { name: /Create Subtopic/ }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('PUTs when editing an existing subtopic', async () => {
    const onSuccess = vi.fn()
    const onClose = vi.fn()
    let method = ''
    server.use(
      http.get(url('/admin/topics'), () => HttpResponse.json([topic])),
      http.put(url('/admin/subtopics/10'), ({ request }) => {
        method = request.method
        return HttpResponse.json(existing)
      })
    )
    render(<AdminSubtopicForm onClose={onClose} onSuccess={onSuccess} subtopic={existing} />)
    await userEvent.click(screen.getByRole('button', { name: /Update Subtopic/ }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(method).toBe('PUT')
    expect(onClose).toHaveBeenCalled()
  })

  it('Cancel resets and closes', async () => {
    const onClose = vi.fn()
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    render(<AdminSubtopicForm onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('typing clears the field error', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    render(<AdminSubtopicForm onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /Create Subtopic/ }))
    expect(await screen.findByText('Subtopic name is required')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Subtopic Name'), 'A')
    expect(screen.queryByText('Subtopic name is required')).not.toBeInTheDocument()
  })
})
