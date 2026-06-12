import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API_BASE_URL } from './client'
import {
  getTopics,
  getTopicSubtopicIds,
  getSubtopicsBatch,
  getSubtopic,
  type TopicSummary,
  type SubtopicSummary,
  type SubtopicDetail,
} from './topics'

const url = (path: string) => `${API_BASE_URL}${path}`

const sampleTopic: TopicSummary = {
  id: 1,
  name: 'Food',
  description: 'About food',
  image_url: 'http://img/food.png',
  sort_order: 1,
  subtopics_total: 3,
  subtopics_completed: 1,
}

const sampleSubtopic: SubtopicSummary = {
  id: 10,
  name: 'Drinks',
  description: 'd',
  image_url: 'http://img/d.png',
  sort_order: 1,
  words_count: 5,
  disabled_mechanics: [],
  status: 'unblocked',
  completed_mechanics_count: 0,
  total_mechanics_count: 5,
}

const sampleDetail: SubtopicDetail = {
  id: 10,
  name: 'Drinks',
  description: 'd',
  image_url: 'http://img/d.png',
  words_count: 5,
  disabled_mechanics: [],
  levels: [
    {
      mechanic_type: 'flashcards',
      status: 'unblocked',
      started_at: null,
      completed_at: null,
    },
  ],
}

describe('topics API', () => {
  it('getTopics returns the topics list', async () => {
    server.use(http.get(url('/topics'), () => HttpResponse.json({ topics: [sampleTopic] })))
    const result = await getTopics()
    expect(result.topics).toEqual([sampleTopic])
  })

  it('getTopicSubtopicIds extracts subtopic_ids from the detail response', async () => {
    server.use(
      http.get(url('/topics/7'), () => HttpResponse.json({ subtopic_ids: [101, 102, 103] }))
    )
    await expect(getTopicSubtopicIds(7)).resolves.toEqual([101, 102, 103])
  })

  it('getSubtopicsBatch POSTs { ids } and returns the array', async () => {
    let receivedBody: unknown = null
    server.use(
      http.post(url('/subtopics/batch'), async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json([sampleSubtopic])
      })
    )

    const result = await getSubtopicsBatch([10, 11])
    expect(receivedBody).toEqual({ ids: [10, 11] })
    expect(result).toEqual([sampleSubtopic])
  })

  it('getSubtopic returns the detail by id', async () => {
    server.use(http.get(url('/subtopics/10'), () => HttpResponse.json(sampleDetail)))
    await expect(getSubtopic(10)).resolves.toEqual(sampleDetail)
  })

  it('propagates server errors from getTopics', async () => {
    server.use(
      http.get(url('/topics'), () => HttpResponse.json({ message: 'boom' }, { status: 500 }))
    )
    await expect(getTopics()).rejects.toThrow('boom')
  })
})
