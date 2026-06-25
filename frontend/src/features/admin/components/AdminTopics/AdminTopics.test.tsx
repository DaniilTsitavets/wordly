import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { AdminTopics } from './AdminTopics'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic = {
  id: 1,
  name: 'Food',
  description: 'd',
  image_url: 'http://img/f.png',
  sort_order: 1,
  subtopics_count: 3,
}

describe('AdminTopics', () => {
  it('shows the loading state initially', () => {
    server.use(http.get(url('/admin/topics'), () => new Promise(() => {})))
    renderWithProviders(<AdminTopics />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders topics in the table once loaded', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    renderWithProviders(<AdminTopics />)
    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())
  })

  it('opens the form when "Add New Topic" is clicked', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([])))
    renderWithProviders(<AdminTopics />)
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /Add New Topic/ }))
    expect(screen.getByRole('heading', { name: 'New Topic' })).toBeInTheDocument()
  })

  it('opens the delete modal with the topic name', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    renderWithProviders(<AdminTopics />)
    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/Delete "Food"\?/)).toBeInTheDocument()
  })

  it('confirms delete then refetches the list', async () => {
    let getCount = 0
    server.use(
      http.get(url('/admin/topics'), () => {
        getCount++
        if (getCount === 1) return HttpResponse.json([topic])
        return HttpResponse.json([])
      }),
      http.delete(url('/admin/topics/1'), () => new HttpResponse(null, { status: 204 }))
    )

    renderWithProviders(<AdminTopics />)
    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    // After opening the modal, both the table row and the modal show a Delete
    // button — scope the click to the modal dialog.
    const dialog = screen.getByRole('dialog')
    const { getByRole } = await import('@testing-library/react').then((m) => m.within(dialog))
    await userEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.queryByText('Food')).not.toBeInTheDocument())
  })

  it('cancel-delete dismisses the modal without DELETE', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    renderWithProviders(<AdminTopics />)
    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText(/Delete "Food"\?/)).not.toBeInTheDocument()
  })

  it('clicking Edit opens the form prefilled with the topic name', async () => {
    server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
    renderWithProviders(<AdminTopics />)
    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit Topic' })).toBeInTheDocument()
    expect(screen.getByLabelText('Topic Name')).toHaveValue('Food')
  })
})
