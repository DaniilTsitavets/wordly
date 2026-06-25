import { apiRequest } from './client'
import type { UserProfile } from './user'

interface AuthResponse {
  access_token: string
  user: UserProfile
}

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  surname: string
  email: string
  password: string
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' })
}

export function loginAsGuest(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/guest', { method: 'POST', auth: false })
}

interface GoogleOAuthPayload {
  code: string
  redirect_uri: string
}

export function signInWithGoogle(payload: GoogleOAuthPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/oauth/google', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}
