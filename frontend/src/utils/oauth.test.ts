import { describe, it, expect } from 'vitest'
import { GOOGLE_REDIRECT_PATH, GOOGLE_REDIRECT_URI, buildGoogleAuthorizeUrl } from './oauth'

describe('oauth utils', () => {
  it('exposes the callback path constant', () => {
    expect(GOOGLE_REDIRECT_PATH).toBe('/oauth/callback')
  })

  it('falls back to window.origin + callback path when env override is missing', () => {
    expect(GOOGLE_REDIRECT_URI).toBe(`${window.location.origin}${GOOGLE_REDIRECT_PATH}`)
  })

  describe('buildGoogleAuthorizeUrl', () => {
    const url = buildGoogleAuthorizeUrl()
    const parsed = new URL(url)
    const params = parsed.searchParams

    it('points at the Google authorize endpoint', () => {
      expect(parsed.origin + parsed.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    })

    it('uses the authorization code response_type', () => {
      expect(params.get('response_type')).toBe('code')
    })

    it('requests openid + email + profile scope', () => {
      expect(params.get('scope')).toBe('openid email profile')
    })

    it('forces the account chooser via prompt=select_account', () => {
      expect(params.get('prompt')).toBe('select_account')
    })

    it('forwards the configured redirect_uri', () => {
      expect(params.get('redirect_uri')).toBe(GOOGLE_REDIRECT_URI)
    })

    it('includes a client_id parameter (may be empty when env is unset in tests)', () => {
      expect(params.has('client_id')).toBe(true)
    })
  })
})
