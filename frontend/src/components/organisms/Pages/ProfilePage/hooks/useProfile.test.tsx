import type { ReactNode } from 'react'
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from '@/api/client'
import { makeStore } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { useProfile } from './useProfile'

const url = (path: string) => `${API_BASE_URL}${path}`

const wrap = (preloadedState?: Parameters<typeof makeStore>[0]) => {
  const store = makeStore(preloadedState)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return { store, wrapper }
}

describe('useProfile', () => {
  it('starts loading when no cached user, then fetches /users/me', async () => {
    const { wrapper, store } = wrap()
    const { result } = renderHook(() => useProfile(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.profile).toEqual(mockUser)
    expect(store.getState().auth.user).toEqual(mockUser)
  })

  it('seeds profile from the Redux cache while the background fetch runs', async () => {
    const { wrapper } = wrap({
      auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
    })

    const { result } = renderHook(() => useProfile(), { wrapper })

    // Cached user is available synchronously, even if the hook briefly
    // re-fetches in the background.
    expect(result.current.profile).toEqual(mockUser)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.profile).toEqual(mockUser)
  })

  it('sets error when /users/me fails', async () => {
    server.use(
      http.get(url('/users/me'), () =>
        HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      )
    )

    const { wrapper } = wrap()
    const { result } = renderHook(() => useProfile(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('unauthorized')
  })

  it('updateProfile() PUTs and updates both local + redux state', async () => {
    server.use(
      http.put(url('/users/me'), () => HttpResponse.json({ ...mockUser, name: 'Updated' }))
    )

    const { wrapper, store } = wrap()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let returned
    await act(async () => {
      returned = await result.current.updateProfile({ name: 'Updated' })
    })

    expect(returned).toMatchObject({ name: 'Updated' })
    expect(result.current.profile?.name).toBe('Updated')
    expect(store.getState().auth.user?.name).toBe('Updated')
    expect(result.current.saveError).toBeNull()
  })

  it('updateProfile() sets saveError + returns null on failure', async () => {
    server.use(
      http.put(url('/users/me'), () =>
        HttpResponse.json({ message: 'validation failed' }, { status: 422 })
      )
    )

    const { wrapper } = wrap()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let returned
    await act(async () => {
      returned = await result.current.updateProfile({ name: '' })
    })

    expect(returned).toBeNull()
    expect(result.current.saveError).toBe('validation failed')
  })
})
