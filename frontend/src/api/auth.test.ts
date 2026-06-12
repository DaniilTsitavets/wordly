import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { login, register, logout, loginAsGuest, signInWithGoogle } from './auth'
import { mockUser } from '@/test/handlers'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('auth API', () => {
  describe('login', () => {
    it('POSTs credentials and returns the auth response', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/auth/login'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ access_token: 'tok', user: mockUser })
        })
      )

      const result = await login({ email: 'a@b.c', password: 'pw' })
      expect(receivedBody).toEqual({ email: 'a@b.c', password: 'pw' })
      expect(result.access_token).toBe('tok')
      expect(result.user).toEqual(mockUser)
    })

    it('propagates server errors', async () => {
      server.use(
        http.post(url('/auth/login'), () =>
          HttpResponse.json({ message: 'invalid' }, { status: 401 })
        )
      )
      await expect(login({ email: 'a@b.c', password: 'pw' })).rejects.toThrow('invalid')
    })
  })

  describe('register', () => {
    it('POSTs the full registration payload', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/auth/register'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ access_token: 'tok', user: mockUser })
        })
      )

      await register({ name: 'A', surname: 'B', email: 'a@b.c', password: 'pw' })
      expect(receivedBody).toEqual({ name: 'A', surname: 'B', email: 'a@b.c', password: 'pw' })
    })
  })

  describe('logout', () => {
    it('POSTs /auth/logout and resolves on 204', async () => {
      await expect(logout()).resolves.toBeUndefined()
    })
  })

  describe('loginAsGuest', () => {
    it('returns a guest user with a token', async () => {
      const result = await loginAsGuest()
      expect(result.access_token).toBe('guest-token')
      expect(result.user.is_guest).toBe(true)
    })
  })

  describe('signInWithGoogle', () => {
    it('forwards the code and redirect_uri to the backend', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/auth/oauth/google'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ access_token: 'tok', user: mockUser })
        })
      )

      await signInWithGoogle({ code: 'auth-code', redirect_uri: 'http://app/cb' })
      expect(receivedBody).toEqual({ code: 'auth-code', redirect_uri: 'http://app/cb' })
    })
  })
})
