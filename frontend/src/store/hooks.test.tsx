import type { ReactNode } from 'react'
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useAppDispatch, useAppSelector } from './hooks'
import { makeStore } from '@/test/test-utils'
import { mockUser } from '@/test/handlers'
import { loginSuccess } from './slices/authSlice'

describe('store hooks', () => {
  it('useAppSelector reads slice state from the store', () => {
    const store = makeStore({
      auth: { token: 'tok', user: mockUser, isLoading: false, error: null },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useAppSelector((s) => s.auth.user), { wrapper })
    expect(result.current).toEqual(mockUser)
  })

  it('useAppDispatch dispatches actions that update state', () => {
    const store = makeStore()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () => {
        const dispatch = useAppDispatch()
        const user = useAppSelector((s) => s.auth.user)
        return { dispatch, user }
      },
      { wrapper }
    )

    expect(result.current.user).toBeNull()

    act(() => {
      result.current.dispatch(loginSuccess({ token: 'tok', user: mockUser }))
    })

    expect(result.current.user).toEqual(mockUser)
  })
})
