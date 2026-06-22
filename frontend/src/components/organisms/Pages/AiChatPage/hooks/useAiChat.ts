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

// Local rotating openers — a frontend stub until the backend exposes
// `GET /ai/chat/opener?subtopicId=...`. No AI call burned on bootstrap.
const OPENER_TEMPLATES = [
  'Hey there! 👋 Ready to practice? Send me something to get the conversation going.',
  "Hi! I'm your practice partner. Tell me what's on your mind — let's chat!",
  "Welcome! Let's have a real conversation in English. What would you like to talk about?",
  "Hey! 👋 Type anything to start — I'll roll with whatever scenario fits.",
]

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function pickOpener(): string {
  return OPENER_TEMPLATES[Math.floor(Math.random() * OPENER_TEMPLATES.length)]
}

function toHistory(messages: ChatDisplayMessage[]): ChatMessage[] {
  return messages.map(({ role, content }) => ({ role, content }))
}

export function useAiChat(subtopicId: number): UseAiChatResult {
  const [messages, setMessages] = useState<ChatDisplayMessage[]>(() => [
    { id: makeId(), role: 'assistant', content: pickOpener(), timestamp: Date.now() },
  ])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesRef = useRef<ChatDisplayMessage[]>(messages)
  messagesRef.current = messages
  const abortRef = useRef<AbortController | null>(null)

  // Cancel any in-flight stream when the subtopic changes or the hook unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [subtopicId])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      // The frontend opener is purely UI — strip it from the history we send
      // to the backend, otherwise the AI thinks it said something it didn't.
      const conversation = messagesRef.current.filter(
        (m) => !(m.role === 'assistant' && OPENER_TEMPLATES.includes(m.content))
      )

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
