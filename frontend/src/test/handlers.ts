import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/api/client'
import type { UserProfile } from '@/api/user'

export const mockUser: UserProfile = {
  id: 1,
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
  is_guest: false,
  role: 'USER',
  interface_language: 'en',
  daily_goal_min: 15,
  notifications_enabled: true,
  color_theme: 'light',
  onboarding_completed: true,
  streak: 0,
  gems: 0,
  last_active_date: '2026-06-11',
  created_at: '2026-01-01',
}

const url = (path: string) => `${API_BASE_URL}${path}`

export const handlers = [
  http.post(url('/auth/login'), () =>
    HttpResponse.json({ access_token: 'test-token', user: mockUser })
  ),
  http.post(url('/auth/register'), () =>
    HttpResponse.json({ access_token: 'test-token', user: mockUser })
  ),
  http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 })),
  http.post(url('/auth/guest'), () =>
    HttpResponse.json({ access_token: 'guest-token', user: { ...mockUser, is_guest: true } })
  ),
  http.post(url('/auth/oauth/google'), () =>
    HttpResponse.json({ access_token: 'google-token', user: mockUser })
  ),
  http.get(url('/users/me'), () => HttpResponse.json(mockUser)),
  // Default no-op stubs for the activity heartbeat + daily-goal claim that
  // `useFinishSession` (and useActivityHeartbeat) fire on most game pages.
  // Individual tests can override via `server.use(...)` when they care.
  http.post(url('/users/me/activity'), () =>
    HttpResponse.json({ minutes_today: 0, daily_goal_min: mockUser.daily_goal_min })
  ),
  http.post(url('/users/me/daily-goal/claim'), () =>
    HttpResponse.json({ reached: false, gems_awarded: 0 })
  ),
]
