import { describe, it, expect, beforeEach } from 'vitest'
import authReducer, {
  setLoading,
  setError,
  loginSuccess,
  setUser,
  addGems,
  logoutSuccess,
} from './authSlice'
import { mockUser } from '@/test/handlers'

const initialState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
}

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the initial state by default', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  describe('setLoading', () => {
    it('flips the loading flag and clears prior errors', () => {
      const state = authReducer({ ...initialState, error: 'boom' }, setLoading(true))
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })
  })

  describe('setError', () => {
    it('stores the error message and stops loading', () => {
      const state = authReducer({ ...initialState, isLoading: true }, setError('bad credentials'))
      expect(state.error).toBe('bad credentials')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('loginSuccess', () => {
    it('stores token + user, clears loading/error, and persists token to localStorage', () => {
      const state = authReducer(
        { ...initialState, isLoading: true, error: 'prev' },
        loginSuccess({ token: 'abc-123', user: mockUser })
      )

      expect(state.token).toBe('abc-123')
      expect(state.user).toEqual(mockUser)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(localStorage.getItem('access_token')).toBe('abc-123')
    })
  })

  describe('setUser', () => {
    it('replaces the user object without touching the token', () => {
      const state = authReducer(
        { ...initialState, token: 'keep-me', user: mockUser },
        setUser({ ...mockUser, name: 'Renamed' })
      )
      expect(state.user?.name).toBe('Renamed')
      expect(state.token).toBe('keep-me')
    })
  })

  describe('addGems', () => {
    it('increments the gem balance on the current user', () => {
      const state = authReducer({ ...initialState, user: { ...mockUser, gems: 5 } }, addGems(3))
      expect(state.user?.gems).toBe(8)
    })

    it('treats missing gems as 0 before incrementing', () => {
      const state = authReducer(
        { ...initialState, user: { ...mockUser, gems: undefined as unknown as number } },
        addGems(4)
      )
      expect(state.user?.gems).toBe(4)
    })

    it('is a no-op when there is no logged-in user', () => {
      const state = authReducer(initialState, addGems(10))
      expect(state.user).toBeNull()
    })
  })

  describe('logoutSuccess', () => {
    it('clears token + user in state and in localStorage', () => {
      localStorage.setItem('access_token', 'old-token')
      const state = authReducer(
        { token: 'old-token', user: mockUser, isLoading: false, error: null },
        logoutSuccess()
      )
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })
})
