import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { AdminTopicForm } from './AdminTopicForm'

const url = (path: string) => `${API_BASE_URL}${path}`

const existingTopic = {
  id: 1,
  name: 'Food',
  description: 'd',
  image_url: '🍎',
  sort_order: 1,
  subtopics_count: 0,
}

describe('AdminTopicForm', () => {
  it('renders the "New Topic" title and an empty name field for create mode', () => {
    render(<AdminTopicForm onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'New Topic' })).toBeInTheDocument()
    expect(screen.getByLabelText('Topic Name')).toHaveValue('')
  })

  it('renders the "Edit Topic" title with prefilled values when given a topic', () => {
    render(<AdminTopicForm onClose={() => {}} topic={existingTopic} />)
    expect(screen.getByRole('heading', { name: 'Edit Topic' })).toBeInTheDocument()
    expect(screen.getByLabelText('Topic Name')).toHaveValue('Food')
    expect(screen.getByLabelText('Description')).toHaveValue('d')
  })

  it('shows a validation error when name is empty', async () => {
    render(<AdminTopicForm onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /Create Topic/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Topic name is required')
  })

  it('submits create + fires onSuccess + onClose', async () => {
    const onSuccess = vi.fn()
    const onClose = vi.fn()
    server.use(http.post(url('/admin/topics'), () => HttpResponse.json(existingTopic)))

    render(<AdminTopicForm onClose={onClose} onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText('Topic Name'), 'Food')
    await userEvent.click(screen.getByRole('button', { name: /Create Topic/ }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it('Cancel calls onClose', async () => {
    const onClose = vi.fn()
    render(<AdminTopicForm onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('PUTs when editing an existing topic', async () => {
    const onSuccess = vi.fn()
    let method = ''
    server.use(
      http.put(url('/admin/topics/1'), ({ request }) => {
        method = request.method
        return HttpResponse.json(existingTopic)
      })
    )
    render(<AdminTopicForm onClose={() => {}} onSuccess={onSuccess} topic={existingTopic} />)
    await userEvent.click(screen.getByRole('button', { name: /Update Topic/ }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(method).toBe('PUT')
  })

  it('typing clears the name error', async () => {
    render(<AdminTopicForm onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /Create Topic/ }))
    expect(await screen.findByText('Topic name is required')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Topic Name'), 'X')
    expect(screen.queryByText('Topic name is required')).not.toBeInTheDocument()
  })
})
