import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { makeStore } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { AppRoutes } from './AppRoutes'

const url = (path: string) => `${API_BASE_URL}${path}`

function renderAt(route: string, preload?: Parameters<typeof makeStore>[0]) {
  return render(
    <Provider store={makeStore(preload)}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </Provider>
  )
}

import { render } from '@testing-library/react'

describe('AppRoutes', () => {
  it('renders the HomePage at /', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [] })))

    renderAt('/', {
      auth: {
        token: 'tok',
        user: { ...mockUser, is_guest: false },
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => expect(screen.getByText('Темы не найдены')).toBeInTheDocument())
  })

  it('redirects /admin to /admin/dashboard then renders Dashboard', async () => {
    renderAt('/admin', {
      auth: {
        token: 'tok',
        user: { ...mockUser, role: 'ADMIN', is_guest: false },
        isLoading: false,
        error: null,
      },
    })

    expect(screen.getByRole('heading', { name: 'Dashboard Overview' })).toBeInTheDocument()
  })

  it('protected route redirects guest user to /', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [] })))

    renderAt('/profile', {
      auth: {
        token: 'tok',
        user: { ...mockUser, is_guest: true },
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => expect(screen.getByText('Темы не найдены')).toBeInTheDocument())
  })
})
