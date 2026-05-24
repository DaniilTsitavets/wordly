import { apiRequest } from './client'

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

export interface AiChatResponse {
  reply: string
}

export function sendChatMessage(payload: AiChatRequest): Promise<AiChatResponse> {
  return apiRequest<AiChatResponse>('/ai/chat', { method: 'POST', body: payload })
}
