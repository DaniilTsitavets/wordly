import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import {
  getAdminTopics,
  createAdminTopic,
  updateAdminTopic,
  deleteAdminTopic,
  getAdminSubtopics,
  createAdminSubtopic,
  updateAdminSubtopic,
  deleteAdminSubtopic,
  getAdminWords,
  createAdminWord,
  updateAdminWord,
  deleteAdminWord,
  type AdminTopic,
  type AdminSubtopic,
  type AdminWord,
} from './admin'

const url = (path: string) => `${API_BASE_URL}${path}`

const topic: AdminTopic = {
  id: 1,
  name: 'Food',
  description: 'd',
  image_url: null,
  sort_order: 1,
  subtopics_count: 0,
}

const subtopic: AdminSubtopic = {
  id: 10,
  topic_id: 1,
  name: 'Drinks',
  description: null,
  image_url: null,
  sort_order: 1,
  words_count: 0,
  disabled_mechanics: [],
}

const word: AdminWord = {
  id: 100,
  subtopic_id: 10,
  word_en: 'tea',
  transcription_en: '[tiː]',
  translation_ru: 'чай',
  image_url: null,
  usage_example_en: null,
  usage_example_en_translation_ru: null,
  mnemonic_image_url: null,
  mnemo_text: null,
}

describe('admin API', () => {
  // ─── Topics ────────────────────────────────────────────────────────────────
  describe('topics', () => {
    it('getAdminTopics returns the list', async () => {
      server.use(http.get(url('/admin/topics'), () => HttpResponse.json([topic])))
      await expect(getAdminTopics()).resolves.toEqual([topic])
    })

    it('createAdminTopic POSTs the payload', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/admin/topics'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json(topic)
        })
      )

      const result = await createAdminTopic({ name: 'Food', description: 'd' })
      expect(receivedBody).toEqual({ name: 'Food', description: 'd' })
      expect(result).toEqual(topic)
    })

    it('updateAdminTopic PUTs the payload to the id-scoped URL', async () => {
      let receivedMethod = ''
      let receivedBody: unknown = null
      server.use(
        http.put(url('/admin/topics/1'), async ({ request }) => {
          receivedMethod = request.method
          receivedBody = await request.json()
          return HttpResponse.json(topic)
        })
      )

      await updateAdminTopic(1, { name: 'Updated' })
      expect(receivedMethod).toBe('PUT')
      expect(receivedBody).toEqual({ name: 'Updated' })
    })

    it('deleteAdminTopic sends DELETE and resolves on 204', async () => {
      let receivedMethod = ''
      server.use(
        http.delete(url('/admin/topics/1'), ({ request }) => {
          receivedMethod = request.method
          return new HttpResponse(null, { status: 204 })
        })
      )

      await expect(deleteAdminTopic(1)).resolves.toBeUndefined()
      expect(receivedMethod).toBe('DELETE')
    })
  })

  // ─── Subtopics ─────────────────────────────────────────────────────────────
  describe('subtopics', () => {
    it('getAdminSubtopics passes topic_id as a query string', async () => {
      let receivedUrl = ''
      server.use(
        http.get(url('/admin/subtopics'), ({ request }) => {
          receivedUrl = request.url
          return HttpResponse.json([subtopic])
        })
      )

      const result = await getAdminSubtopics(7)
      expect(receivedUrl).toContain('topic_id=7')
      expect(result).toEqual([subtopic])
    })

    it('createAdminSubtopic POSTs the payload', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/admin/subtopics'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json(subtopic)
        })
      )

      await createAdminSubtopic({ topic_id: 1, name: 'Drinks' })
      expect(receivedBody).toEqual({ topic_id: 1, name: 'Drinks' })
    })

    it('updateAdminSubtopic PUTs to the id-scoped URL', async () => {
      server.use(http.put(url('/admin/subtopics/10'), () => HttpResponse.json(subtopic)))
      await expect(updateAdminSubtopic(10, { topic_id: 1, name: 'Updated' })).resolves.toEqual(
        subtopic
      )
    })

    it('deleteAdminSubtopic DELETEs the id-scoped URL', async () => {
      server.use(
        http.delete(url('/admin/subtopics/10'), () => new HttpResponse(null, { status: 204 }))
      )
      await expect(deleteAdminSubtopic(10)).resolves.toBeUndefined()
    })
  })

  // ─── Words ─────────────────────────────────────────────────────────────────
  describe('words', () => {
    it('getAdminWords passes subtopic_id as a query string', async () => {
      let receivedUrl = ''
      server.use(
        http.get(url('/admin/words'), ({ request }) => {
          receivedUrl = request.url
          return HttpResponse.json([word])
        })
      )

      await getAdminWords(10)
      expect(receivedUrl).toContain('subtopic_id=10')
    })

    it('createAdminWord POSTs the payload', async () => {
      let receivedBody: unknown = null
      server.use(
        http.post(url('/admin/words'), async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json(word)
        })
      )

      await createAdminWord({ subtopic_id: 10, word_en: 'tea', translation_ru: 'чай' })
      expect(receivedBody).toEqual({ subtopic_id: 10, word_en: 'tea', translation_ru: 'чай' })
    })

    it('updateAdminWord PUTs to the id-scoped URL', async () => {
      server.use(http.put(url('/admin/words/100'), () => HttpResponse.json(word)))
      await expect(
        updateAdminWord(100, { subtopic_id: 10, word_en: 'tea', translation_ru: 'чай' })
      ).resolves.toEqual(word)
    })

    it('deleteAdminWord DELETEs the id-scoped URL', async () => {
      server.use(
        http.delete(url('/admin/words/100'), () => new HttpResponse(null, { status: 204 }))
      )
      await expect(deleteAdminWord(100)).resolves.toBeUndefined()
    })
  })
})
