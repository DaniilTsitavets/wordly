import { useCallback, useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '@/api/ai'
import type { ChatMessage, ChatRole } from '@/api/ai'

export interface ChatDisplayMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: number
}

interface UseAiChatResult {
  messages: ChatDisplayMessage[]
  isBootstrapping: boolean
  isSending: boolean
  error: string | null
  hasUserMessages: boolean
  send: (text: string) => Promise<void>
}

const BOOTSTRAP_SEED = 'Hello!'

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
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesRef = useRef<ChatDisplayMessage[]>([])
  messagesRef.current = messages

  // Fetch the assistant's opening message (mock keys off an empty history).
  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      try {
        setIsBootstrapping(true)
        setError(null)
        const { reply } = await sendChatMessage({
          subtopicId,
          history: [],
          message: BOOTSTRAP_SEED,
        })
        if (!cancelled) {
          setMessages([{ id: makeId(), role: 'assistant', content: reply, timestamp: Date.now() }])
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to start chat')
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [subtopicId])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      const userMessage: ChatDisplayMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      const history = toHistory(messagesRef.current)
      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)
      setError(null)

      try {
        const { reply } = await sendChatMessage({ subtopicId, history, message: trimmed })
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: 'assistant', content: reply, timestamp: Date.now() },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
      } finally {
        setIsSending(false)
      }
    },
    [subtopicId, isSending]
  )

  return {
    messages,
    isBootstrapping,
    isSending,
    error,
    hasUserMessages: messages.some((m) => m.role === 'user'),
    send,
  }
}
