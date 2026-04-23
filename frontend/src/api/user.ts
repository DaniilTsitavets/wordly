import { apiRequest } from './client'

export interface UserProfile {
  id: number
  name: string
  surname: string
  email: string
  is_guest: boolean
  interface_language: string
  daily_goal_min: number
  notifications_enabled: boolean
  color_theme: 'light' | 'dark' | 'system'
  streak: number
  gems: number
  last_active_date: string
  created_at: string
}

export function getMe(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/users/me')
}
