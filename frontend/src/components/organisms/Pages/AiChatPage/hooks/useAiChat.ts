import { useCallback, useEffect, useRef, useState } from 'react'
import { streamChatMessage } from '@/api/ai'
import type { ChatMessage, ChatRole } from '@/api/ai'

export interface ChatDisplayMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: number
}

interface UseAiChatResult {
  messages: ChatDisplayMessage[]
  isSending: boolean
  error: string | null
  hasUserMessages: boolean
  send: (text: string) => Promise<void>
}

// Invisible kickoff sent to the backend so the AI's first turn is its real,
// vocabulary-aware scenario opener instead of a hardcoded UI stub. Per the
// backend system prompt the AI's first message is always the scenario setup
// regardless of what the user actually said, so the text here is irrelevant —
// it just satisfies the required `message` field on the request.
const KICKOFF_MESSAGE = "Let's start!"

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toHistory(messages: ChatDisplayMessage[]): ChatMessage[] {
  return messages.map(({ role, content }) => ({ role, content }))
}

export function useAiChat(subtopicId: number): UseAiChatResult {
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesRef = useRef<ChatDisplayMessage[]>(messages)
  messagesRef.current = messages
  const abortRef = useRef<AbortController | null>(null)

  // Fire the AI's scenario opener once on mount. AiChatBody keys this hook by
  // subtopicId, so a topic switch fully remounts and re-kicks off.
  useEffect(() => {
    const assistantId = makeId()
    setMessages([{ id: assistantId, role: 'assistant', content: '', timestamp: Date.now() }])
    setIsSending(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    streamChatMessage(
      { subtopicId, history: [], message: KICKOFF_MESSAGE },
      {
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
          )
        },
      }
    )
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Failed to start chat')
      })
      .finally(() => {
        if (abortRef.current === controller) abortRef.current = null
        setIsSending(false)
      })

    return () => controller.abort()
  }, [subtopicId])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      const conversation = messagesRef.current
      const userMessage: ChatDisplayMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      const assistantId = makeId()
      const assistantPlaceholder: ChatDisplayMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
      setIsSending(true)
      setError(null)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        await streamChatMessage(
          {
            subtopicId,
            history: toHistory(conversation),
            message: trimmed,
          },
          {
            signal: controller.signal,
            onToken: (token) => {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
              )
            },
          }
        )
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to send message')
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null
        setIsSending(false)
      }
    },
    [subtopicId, isSending]
  )

  return {
    messages,
    isSending,
    error,
    hasUserMessages: messages.some((m) => m.role === 'user'),
    send,
  }
}
