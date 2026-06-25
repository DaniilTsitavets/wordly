export const GOOGLE_REDIRECT_PATH = '/oauth/callback'

// Prefer the explicit env override (must match the value registered in Google Cloud
// and what the backend forwards to Google). Fall back to the current origin for local dev.
const ENV_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI ?? ''
export const GOOGLE_REDIRECT_URI =
  ENV_REDIRECT_URI ||
  (typeof window !== 'undefined' ? `${window.location.origin}${GOOGLE_REDIRECT_PATH}` : '')

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export function buildGoogleAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
