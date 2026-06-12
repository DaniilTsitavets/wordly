import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { AdminWordForm } from './AdminWordForm'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic = {
  id: 1,
  name: 'Food',
  description: null,
  image_url: null,
  sort_order: null,
  subtopics_count: 1,
}

describe('AdminWordForm', () => {
  it('renders New Word with empty fields', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([])))
    render(<AdminWordForm onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'New Word' })).toBeInTheDocument()
    expect(screen.getByLabelText('English')).toHaveValue('')
    expect(screen.getByLabelText('Russian')).toHaveValue('')
  })

  it('shows validation errors when submitted empty', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([])))
    render(<AdminWordForm onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /Create Word/ }))
    expect(await screen.findByText('English word is required')).toBeInTheDocument()
    expect(screen.getByText('Russian translation is required')).toBeInTheDocument()
    expect(screen.getByText('Topic is required')).toBeInTheDocument()
    expect(screen.getByText('Subtopic is required')).toBeInTheDocument()
  })

  it('Subtopic select is disabled until a topic is chosen', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    render(<AdminWordForm onClose={() => {}} />)
    await waitFor(() => expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument())
    expect(screen.getByLabelText('Suptopic')).toBeDisabled()
  })

  it('Cancel calls onClose', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([])))
    const onClose = vi.fn()
    render(<AdminWordForm onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('typing in fields updates them and clears the corresponding error', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([])))
    render(<AdminWordForm onClose={() => {}} />)
    // Trigger validation errors first
    await userEvent.click(screen.getByRole('button', { name: /Create Word/ }))
    expect(await screen.findByText('English word is required')).toBeInTheDocument()

    // Now type — that error clears
    await userEvent.type(screen.getByLabelText('English'), 'apple')
    expect(screen.queryByText('English word is required')).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Russian'), 'яблоко')
    expect(screen.queryByText('Russian translation is required')).not.toBeInTheDocument()
  })

  it('selects topic + loads subtopics + enables subtopic select', async () => {
    const subtopic = {
      id: 10,
      topic_id: 1,
      name: 'Drinks',
      description: null,
      image_url: null,
      sort_order: 1,
      words_count: 0,
      disabled_mechanics: [],
    }
    server.use(
      http.get(url('/admin/topics'), () =>
        HttpResponse.json([
          {
            id: 1,
            name: 'Food',
            description: null,
            image_url: null,
            sort_order: null,
            subtopics_count: 1,
          },
        ])
      ),
      http.get(url('/admin/subtopics'), () => HttpResponse.json([subtopic]))
    )

    render(<AdminWordForm onClose={() => {}} />)
    await waitFor(() => expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByLabelText('Topic'), '1')
    await waitFor(() => expect(screen.getByLabelText('Suptopic')).not.toBeDisabled())
  })

  it('Is mnemonic? toggle stores yes/no', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([])))
    render(<AdminWordForm onClose={() => {}} />)
    const toggle = screen.getByLabelText('Is mnemonic?') as HTMLSelectElement
    expect(toggle.value).toBe('no')
    await userEvent.selectOptions(toggle, 'yes')
    expect(toggle.value).toBe('yes')
  })
})
