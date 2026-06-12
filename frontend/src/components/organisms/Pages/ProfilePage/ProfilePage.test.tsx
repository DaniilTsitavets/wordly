import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { ProfilePage } from './ProfilePage'

const url = (path: string) => `${API_BASE_URL}${path}`

const customUser = { ...mockUser, name: 'Foo', surname: 'Bar' }

const preloaded = {
  auth: {
    token: 'tok',
    user: customUser,
    isLoading: false,
    error: null,
  },
}

beforeEach(() => {
  // Override the default /users/me handler so the background refetch in
  // useProfile keeps the same name/surname rather than reverting to mockUser.
  server.use(http.get(url('/users/me'), () => HttpResponse.json(customUser)))
})

describe('ProfilePage', () => {
  it('renders header with name and stats from the cached profile', async () => {
    renderWithProviders(<ProfilePage />, { preloadedState: preloaded })

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Profile & Statistics' })).toBeInTheDocument()
    )
    expect(screen.getByText('Foo Bar')).toBeInTheDocument()
  })

  it('renders error when /users/me fails and no cache', async () => {
    server.use(
      http.get(url('/users/me'), () => HttpResponse.json({ message: 'auth' }, { status: 401 }))
    )
    renderWithProviders(<ProfilePage />)
    await waitFor(() => expect(screen.getByText('auth')).toBeInTheDocument())
  })

  it('shows Personal info tab by default', async () => {
    renderWithProviders(<ProfilePage />, { preloadedState: preloaded })
    expect(await screen.findByRole('tab', { name: 'Personal info' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('Update Profile button is disabled when nothing changed', async () => {
    renderWithProviders(<ProfilePage />, { preloadedState: preloaded })
    expect(await screen.findByRole('button', { name: /Update Profile/ })).toBeDisabled()
  })

  it('enables editing a field after clicking the edit toggle', async () => {
    renderWithProviders(<ProfilePage />, { preloadedState: preloaded })

    const editName = await screen.findByLabelText('Edit Name')
    expect(screen.getByLabelText('Name')).toHaveAttribute('readOnly')
    await userEvent.click(editName)
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('readOnly')
  })

  it('submits the changed field and shows the success message', async () => {
    server.use(
      http.put(url('/users/me'), () => HttpResponse.json({ ...mockUser, name: 'Newname' }))
    )

    renderWithProviders(<ProfilePage />, { preloadedState: preloaded })
    await userEvent.click(await screen.findByLabelText('Edit Name'))
    const input = screen.getByLabelText('Name')
    await userEvent.clear(input)
    await userEvent.type(input, 'Newname')
    await userEvent.click(screen.getByRole('button', { name: /Update Profile/ }))
    await waitFor(() => expect(screen.getByText('Profile updated')).toBeInTheDocument())
  })

  it('switches to My statistics tab and shows Daily Goal card', async () => {
    server.use(
      http.get(url('/users/me/daily-progress'), () =>
        HttpResponse.json({ words_learned_today: 4, daily_goal_words: 8 })
      )
    )

    renderWithProviders(<ProfilePage />, { preloadedState: preloaded })
    await userEvent.click(await screen.findByRole('tab', { name: 'My statistics' }))
    await waitFor(() => expect(screen.getByText('Daily Goal')).toBeInTheDocument())
    expect(screen.getByText('4 / 8')).toBeInTheDocument()
  })
})
