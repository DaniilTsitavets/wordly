import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SendHorizontal } from 'lucide-react'
import { IconFont } from '@/components/atoms/IconFont'
import { IS_DEMO_API } from '@/api/client'
import { getSubtopic } from '@/api/topics'
import { useActivityHeartbeat } from '@/shared/hooks/useActivityHeartbeat'
import { useAiChat } from './hooks/useAiChat'
import type { ChatDisplayMessage } from './hooks/useAiChat'
import { TopicPickerModal } from './components'
import type { PickedSubtopic } from './components'
import styles from './AiChatPage.module.scss'

export function AiChatPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawSubtopicId = Number(searchParams.get('subtopicId'))
  const subtopicId = Number.isFinite(rawSubtopicId) && rawSubtopicId > 0 ? rawSubtopicId : null

  const [topicLabel, setTopicLabel] = useState<{
    id: number
    topic: string
    subtopic: string
  } | null>(null)
  const [isPickerManuallyOpen, setIsPickerManuallyOpen] = useState(false)
  const isPickerOpen = subtopicId === null || isPickerManuallyOpen

  // Hard reload with `?subtopicId=N` — fetch the name for the header pill.
  useEffect(() => {
    if (subtopicId === null) return
    if (topicLabel?.id === subtopicId) return
    let cancelled = false
    getSubtopic(subtopicId)
      .then((data) => {
        if (!cancelled) setTopicLabel({ id: subtopicId, topic: '', subtopic: data.name })
      })
      .catch(() => {
        /* leave the pill blank — non-fatal */
      })
    return () => {
      cancelled = true
    }
  }, [subtopicId, topicLabel])

  const handlePicked = (picked: PickedSubtopic) => {
    setTopicLabel({
      id: picked.subtopicId,
      topic: picked.topicName,
      subtopic: picked.subtopicName,
    })
    setIsPickerManuallyOpen(false)
    const next = new URLSearchParams(searchParams)
    next.set('subtopicId', String(picked.subtopicId))
    // Replace so back button skips the picker step.
    setSearchParams(next, { replace: true })
  }

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
          <p className={styles.subtitle}>
            {topicLabel
              ? topicLabel.topic
                ? `${topicLabel.topic} · ${topicLabel.subtopic}`
                : topicLabel.subtopic
              : 'Practice your vocabulary with AI'}
          </p>
        </div>
        {subtopicId !== null && (
          <button
            type="button"
            className={styles.changeTopicButton}
            onClick={() => setIsPickerManuallyOpen(true)}
          >
            Change topic
          </button>
        )}
        {IS_DEMO_API && (
          <span className={styles.demoBadge}>
            <span className={styles.demoDot} aria-hidden="true" />
            Demo Mode
          </span>
        )}
      </header>

      {subtopicId === null ? (
        <EmptyState onPick={() => setIsPickerManuallyOpen(true)} />
      ) : (
        <AiChatBody key={subtopicId} subtopicId={subtopicId} />
      )}

      <TopicPickerModal
        isOpen={isPickerOpen}
        required={subtopicId === null}
        onClose={() => setIsPickerManuallyOpen(false)}
        onPick={handlePicked}
      />
    </div>
  )
}

function EmptyState({ onPick }: { onPick: () => void }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyAvatar} aria-hidden="true">
        <IconFont name="sparkle" size={28} color="#ffffff" decorative />
      </div>
      <h2 className={styles.emptyTitle}>Pick a topic to start practicing</h2>
      <p className={styles.emptyText}>
        The AI uses the vocabulary from your chosen subtopic to guide the conversation.
      </p>
      <button type="button" className={styles.emptyButton} onClick={onPick}>
        Choose topic
      </button>
    </div>
  )
}

function AiChatBody({ subtopicId }: { subtopicId: number }) {
  const { messages, isSending, error, send } = useAiChat(subtopicId)
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

  const lastMessage = messages[messages.length - 1]
  const showTyping =
    isSending && (!lastMessage || lastMessage.role === 'user' || lastMessage.content === '')

  return (
    <>
      <div className={styles.chat}>
        <div className={styles.messages} ref={scrollRef}>
          {messages
            .filter((m) => !(m.role === 'assistant' && m.content === ''))
            .map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          {showTyping && <TypingBubble />}
        </div>
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
    </>
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
