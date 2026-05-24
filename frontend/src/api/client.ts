export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4010/api/v1'

// Demo backend = the local mock. Explicit VITE_AI_DEMO wins; otherwise inferred
// from the base URL, so the "Demo Mode" badge auto-hides once a real backend is wired.
export const IS_DEMO_API =
  import.meta.env.VITE_AI_DEMO != null
    ? import.meta.env.VITE_AI_DEMO === 'true'
    : API_BASE_URL.includes('localhost:4010')

function getToken(): string | null {
  return localStorage.getItem('access_token')
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message ?? `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
