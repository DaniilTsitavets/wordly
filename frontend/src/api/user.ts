import { apiRequest } from './client'

export interface UserProfile {
  id: number
  name: string
  surname: string
  email: string
  is_guest: boolean
  role: 'ADMIN' | 'USER'
  interface_language: string
  daily_goal_min: number
  notifications_enabled: boolean
  color_theme: 'light' | 'dark' | 'system'
  onboarding_completed: boolean
  streak: number
  gems: number
  last_active_date: string
  created_at: string
}

export type UpdateUserPayload = Partial<
  Pick<
    UserProfile,
    | 'name'
    | 'surname'
    | 'email'
    | 'interface_language'
    | 'daily_goal_min'
    | 'notifications_enabled'
    | 'color_theme'
    | 'onboarding_completed'
  >
> & { password?: string }

export function getMe(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/users/me')
}

export function updateMe(payload: UpdateUserPayload): Promise<UserProfile> {
  return apiRequest<UserProfile>('/users/me', { method: 'PUT', body: payload })
}

export interface DailyProgress {
  minutes_today: number
  daily_goal_min: number
}

export function getDailyProgress(): Promise<DailyProgress> {
  return apiRequest<DailyProgress>('/users/me/daily-progress')
}

/**
 * Heartbeat — reports study seconds for the daily goal.
 * Per the backend contract (BRD §9.1) the server credits at most the
 * wall-clock time since the last call (capped at 120s/request), so a
 * forged value cannot fast-forward the goal. Send periodically (≤120s)
 * while a learning screen is active.
 */
export function trackActivity(seconds: number): Promise<DailyProgress> {
  return apiRequest<DailyProgress>('/users/me/activity', {
    method: 'POST',
    body: { seconds },
  })
}

export interface DailyGoalClaimResponse {
  reached: boolean
  gems_awarded: number
}

export function claimDailyGoal(): Promise<DailyGoalClaimResponse> {
  return apiRequest<DailyGoalClaimResponse>('/users/me/daily-goal/claim', {
    method: 'POST',
    body: {},
  })
}
