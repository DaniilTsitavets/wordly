import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from '@/api/user'

interface AuthState {
  token: string | null
  user: UserProfile | null
  isLoading: boolean
  error: string | null
}

const storedToken = localStorage.getItem('access_token')

const initialState: AuthState = {
  token: storedToken,
  user: null,
  isLoading: false,
  error: null,
}

interface AuthSuccess {
  token: string
  user: UserProfile
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
      state.error = null
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.isLoading = false
    },
    loginSuccess(state, action: PayloadAction<AuthSuccess>) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isLoading = false
      state.error = null
      localStorage.setItem('access_token', action.payload.token)
    },
    setUser(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload
    },
    addGems(state, action: PayloadAction<number>) {
      if (state.user) {
        state.user.gems = (state.user.gems ?? 0) + action.payload
      }
    },
    logoutSuccess(state) {
            localStorage.removeItem('access_token')

      state.token = null
      state.user = null
    },
  },
})

export const { setLoading, setError, loginSuccess, setUser, addGems, logoutSuccess } =
  authSlice.actions
export default authSlice.reducer
