import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SendHorizontal } from 'lucide-react'
import { IconFont } from '@/components/atoms/IconFont'
import { IS_DEMO_API } from '@/api/client'
import { useActivityHeartbeat } from '@/shared/hooks/useActivityHeartbeat'
import { useAiChat } from './hooks/useAiChat'
import type { ChatDisplayMessage } from './hooks/useAiChat'
import styles from './AiChatPage.module.scss'

const DEFAULT_SUBTOPIC_ID = 1

const SUGGESTED_PROMPTS = [
  'Can you help me practice French food vocabulary?',
  "Let's have a conversation about drinks in French",
  "Quiz me on the words I've learned",
  'Can you create a story using food words?',
]

export function AiChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const subtopicId = Number(searchParams.get('subtopicId')) || DEFAULT_SUBTOPIC_ID

  const { messages, isSending, error, hasUserMessages, send } = useAiChat(subtopicId)
  useActivityHeartbeat()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending])

  const handleSend = (text: string) => {
    const value = text.trim()
    if (!value) return
    setDraft('')
    void send(value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(draft)
    }
  }

  const showPrompts = !hasUserMessages
  // Typing dots only while we're waiting for the first token of the assistant
  // reply — once tokens start flowing, the streaming bubble takes over.
  const lastMessage = messages[messages.length - 1]
  const showTyping =
    isSending && (!lastMessage || lastMessage.role === 'user' || lastMessage.content === '')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IconFont name="arrow-back" size={22} decorative />
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>AI Practice Chat</h1>
          <p className={styles.subtitle}>Practice your vocabulary with AI</p>
        </div>
        {IS_DEMO_API && (
          <span className={styles.demoBadge}>
            <span className={styles.demoDot} aria-hidden="true" />
            Demo Mode
          </span>
        )}
      </header>

      <div className={styles.chat}>
        <div className={styles.messages} ref={scrollRef}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {showTyping && <TypingBubble />}
        </div>

        {showPrompts && (
          <div className={styles.prompts}>
            <p className={styles.promptsLabel}>Try these prompts:</p>
            <div className={styles.promptsList}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.composer}>
        <textarea
          className={styles.input}
          placeholder="Type your message here..."
          value={draft}
          rows={1}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message"
        />
        <button
          type="button"
          className={styles.sendButton}
          onClick={() => handleSend(draft)}
          disabled={!draft.trim() || isSending}
          aria-label="Send message"
        >
          <SendHorizontal size={20} />
        </button>
      </div>
      <p className={styles.hint}>Press Enter to send • Shift + Enter for new line</p>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatDisplayMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}>
      {!isUser && (
        <div className={styles.avatar} aria-hidden="true">
          <IconFont name="sparkle" size={18} color="#ffffff" decorative />
        </div>
      )}
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        <p className={styles.bubbleText}>{message.content}</p>
        <span className={styles.time}>{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className={`${styles.row} ${styles.rowAssistant}`}>
      <div className={styles.avatar} aria-hidden="true">
        <IconFont name="sparkle" size={18} color="#ffffff" decorative />
      </div>
      <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
        <span className={styles.typing} aria-label="AI is typing">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  )
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
