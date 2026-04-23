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
    logoutSuccess(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('access_token')
    },
  },
})

export const { setLoading, setError, loginSuccess, setUser, logoutSuccess } = authSlice.actions
export default authSlice.reducer
