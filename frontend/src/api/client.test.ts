import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { apiRequest, API_BASE_URL } from './client'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('apiRequest', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('GETs and parses JSON by default', async () => {
    server.use(http.get(url('/ping'), () => HttpResponse.json({ ok: true })))
    await expect(apiRequest<{ ok: boolean }>('/ping')).resolves.toEqual({ ok: true })
  })

  it('attaches Bearer token from localStorage on authed requests', async () => {
    localStorage.setItem('access_token', 'tok-1')
    let receivedAuth: string | null = null

    server.use(
      http.get(url('/secret'), ({ request }) => {
        receivedAuth = request.headers.get('authorization')
        return HttpResponse.json({ ok: true })
      })
    )

    await apiRequest('/secret')
    expect(receivedAuth).toBe('Bearer tok-1')
  })

  it('does NOT attach Authorization when auth: false', async () => {
    localStorage.setItem('access_token', 'tok-1')
    let receivedAuth: string | null = null

    server.use(
      http.post(url('/public'), ({ request }) => {
        receivedAuth = request.headers.get('authorization')
        return HttpResponse.json({ ok: true })
      })
    )

    await apiRequest('/public', { method: 'POST', body: {}, auth: false })
    expect(receivedAuth).toBeNull()
  })

  it('serializes the body as JSON', async () => {
    let receivedBody: unknown = null
    server.use(
      http.post(url('/echo'), async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ ok: true })
      })
    )

    await apiRequest('/echo', { method: 'POST', body: { hello: 'world' } })
    expect(receivedBody).toEqual({ hello: 'world' })
  })

  it('returns undefined on 204 No Content', async () => {
    server.use(http.post(url('/empty'), () => new HttpResponse(null, { status: 204 })))
    await expect(apiRequest('/empty', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('throws with the message from the error body on non-2xx', async () => {
    server.use(
      http.get(url('/boom'), () => HttpResponse.json({ message: 'nope' }, { status: 400 }))
    )
    await expect(apiRequest('/boom')).rejects.toThrow('nope')
  })

  it('throws "Unknown error" when the error body is not JSON', async () => {
    server.use(
      http.get(url('/server-error'), () => new HttpResponse('plain text', { status: 500 }))
    )
    await expect(apiRequest('/server-error')).rejects.toThrow('Unknown error')
  })

  it('falls back to HTTP status text when the JSON error body has no message field', async () => {
    server.use(
      http.get(url('/no-message'), () => HttpResponse.json({ code: 'X' }, { status: 500 }))
    )
    await expect(apiRequest('/no-message')).rejects.toThrow('HTTP 500')
  })
})
