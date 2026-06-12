import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import { completeSession } from './completeSession'

const url = (path: string) => `${API_BASE_URL}${path}`

describe('completeSession API', () => {
  it('POSTs { mechanic_type } in snake_case to the subtopic session-complete endpoint', async () => {
    let receivedBody: unknown = null
    server.use(
      http.post(url('/subtopics/3/session/complete'), async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({
          mechanic_type: 'flashcards',
          gems_earned: 10,
          next_mechanic: 'matching',
          subtopic_completed: false,
        })
      })
    )

    const result = await completeSession(3, 'flashcards')
    expect(receivedBody).toEqual({ mechanic_type: 'flashcards' })
    expect(result.gems_earned).toBe(10)
    expect(result.next_mechanic).toBe('matching')
    expect(result.subtopic_completed).toBe(false)
  })

  it('handles the last mechanic in a subtopic (next_mechanic = null, subtopic_completed = true)', async () => {
    server.use(
      http.post(url('/subtopics/3/session/complete'), () =>
        HttpResponse.json({
          mechanic_type: 'word_builder',
          gems_earned: 25,
          next_mechanic: null,
          subtopic_completed: true,
        })
      )
    )

    const result = await completeSession(3, 'word_builder')
    expect(result.next_mechanic).toBeNull()
    expect(result.subtopic_completed).toBe(true)
  })
})
