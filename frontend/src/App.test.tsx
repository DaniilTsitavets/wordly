import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { makeStore } from '@/test/test-utils'
import App from './App'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('App', () => {
  it('renders without crashing (smoke)', () => {
    server.use(
      http.post(url('/auth/guest'), () => new Promise(() => {})),
      http.get(url('/topics'), () => new Promise(() => {}))
    )

    const { container } = render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>
    )
    expect(container).toBeTruthy()
  })
})
