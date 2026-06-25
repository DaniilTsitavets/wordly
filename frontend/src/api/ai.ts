import { API_BASE_URL } from './client'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface AiChatRequest {
  subtopicId: number
  history: ChatMessage[]
  message: string
}

export interface StreamOptions {
  onToken: (token: string) => void
  signal?: AbortSignal
}

/**
 * Sends a chat message and streams the AI reply token-by-token via SSE.
 * Resolves when the stream completes, rejects on transport / HTTP error.
 * Pass an `AbortSignal` to cancel mid-stream (e.g. on unmount).
 */
export async function streamChatMessage(
  payload: AiChatRequest,
  { onToken, signal }: StreamOptions
): Promise<void> {
  const token = localStorage.getItem('access_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    })
  } catch (err) {
    if (signal?.aborted) return
    throw err
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message ?? `HTTP ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Empty response stream')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let receivedAnyToken = false
  // Cancel the reader explicitly — fetch's abort doesn't reliably propagate.
  const onAbort = () => {
    reader.cancel().catch(() => {})
  }
  signal?.addEventListener('abort', onAbort)

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE events are separated by blank lines (\n\n).
      let separatorIdx = buffer.indexOf('\n\n')
      while (separatorIdx !== -1) {
        const event = buffer.slice(0, separatorIdx)
        buffer = buffer.slice(separatorIdx + 2)

        for (const token of parseSseDataLines(event)) {
          if (token === '[DONE]') return
          receivedAnyToken = true
          onToken(token)
        }
        separatorIdx = buffer.indexOf('\n\n')
      }
    }
  } catch (err) {
    if (signal?.aborted) return
    // If any tokens arrived the reply already rendered; swallow trailing
    // HTTP/2 close errors that some proxies emit on SSE-over-POST cleanup.
    if (receivedAnyToken) return
    throw err
  } finally {
    signal?.removeEventListener('abort', onAbort)
  }
}

/**
 * Extracts `data:` payloads from one SSE event block.
 * Handles both `data: <text>` (with space, as our mock and many providers send)
 * and `data:<text>` (no space, Spring's SseEmitter for raw strings).
 */
function parseSseDataLines(event: string): string[] {
  const tokens: string[] = []
  for (const line of event.split('\n')) {
    if (!line.startsWith('data:')) continue
    tokens.push(line.startsWith('data: ') ? line.slice(6) : line.slice(5))
  }
  return tokens
}
