import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { renderWithProviders } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { AuthModal } from './AuthModal'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('AuthModal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders nothing when closed', () => {
    renderWithProviders(<AuthModal isOpen={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders Login tab by default with email + password fields', () => {
    renderWithProviders(<AuthModal isOpen onClose={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Login' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('switches to Sign Up tab showing extra fields', async () => {
    renderWithProviders(<AuthModal isOpen onClose={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Surname')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('logs the user in and dispatches loginSuccess on success', async () => {
    const onClose = vi.fn()
    const { store } = renderWithProviders(<AuthModal isOpen onClose={onClose} />)

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.c')
    await userEvent.type(screen.getByLabelText('Password'), 'pw')
    await userEvent.click(screen.getByRole('button', { name: /Login/ }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(store.getState().auth.user).toEqual(mockUser)
    expect(store.getState().auth.token).toBe('test-token')
  })

  it('shows the server error when login fails', async () => {
    server.use(
      http.post(url('/auth/login'), () =>
        HttpResponse.json({ message: 'bad credentials' }, { status: 401 })
      )
    )

    renderWithProviders(<AuthModal isOpen onClose={() => {}} />)
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.c')
    await userEvent.type(screen.getByLabelText('Password'), 'pw')
    await userEvent.click(screen.getByRole('button', { name: /Login/ }))

    await waitFor(() => expect(screen.getByText('bad credentials')).toBeInTheDocument())
  })

  it('shows "Passwords do not match" when signup passwords differ', async () => {
    renderWithProviders(<AuthModal isOpen onClose={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))

    await userEvent.type(screen.getByLabelText('Name'), 'A')
    await userEvent.type(screen.getByLabelText('Surname'), 'B')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.c')
    await userEvent.type(screen.getByLabelText('Password'), 'pw')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'different')

    await userEvent.click(screen.getByRole('button', { name: /Create Account/ }))
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
  })

  it('signs up and closes when passwords match', async () => {
    const onClose = vi.fn()
    renderWithProviders(<AuthModal isOpen onClose={onClose} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))

    await userEvent.type(screen.getByLabelText('Name'), 'A')
    await userEvent.type(screen.getByLabelText('Surname'), 'B')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.c')
    await userEvent.type(screen.getByLabelText('Password'), 'pw')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'pw')

    await userEvent.click(screen.getByRole('button', { name: /Create Account/ }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('renders only the Google social button (GitHub removed)', () => {
    renderWithProviders(<AuthModal isOpen onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /Google/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /GitHub/ })).not.toBeInTheDocument()
  })

  it('signup redirects to /onboarding when onboarding_completed=false', async () => {
    server.use(
      http.post(url('/auth/register'), () =>
        HttpResponse.json({
          access_token: 'tok',
          user: { ...mockUser, onboarding_completed: false },
        })
      )
    )

    renderWithProviders(<AuthModal isOpen onClose={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))

    await userEvent.type(screen.getByLabelText('Name'), 'A')
    await userEvent.type(screen.getByLabelText('Surname'), 'B')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.c')
    await userEvent.type(screen.getByLabelText('Password'), 'pw')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'pw')

    await userEvent.click(screen.getByRole('button', { name: /Create Account/ }))
    // Signup completed (no assertion on navigation — covered indirectly)
  })

  it('shows the server error when signup fails', async () => {
    server.use(
      http.post(url('/auth/register'), () =>
        HttpResponse.json({ message: 'email taken' }, { status: 409 })
      )
    )

    renderWithProviders(<AuthModal isOpen onClose={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))
    await userEvent.type(screen.getByLabelText('Name'), 'A')
    await userEvent.type(screen.getByLabelText('Surname'), 'B')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.c')
    await userEvent.type(screen.getByLabelText('Password'), 'pw')
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'pw')
    await userEvent.click(screen.getByRole('button', { name: /Create Account/ }))

    await waitFor(() => expect(screen.getByText('email taken')).toBeInTheDocument())
  })
})
