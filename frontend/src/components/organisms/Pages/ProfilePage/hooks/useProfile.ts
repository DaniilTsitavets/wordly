import { useCallback, useEffect, useState } from 'react'
import { getMe, updateMe } from '@/api/user'
import type { UpdateUserPayload, UserProfile } from '@/api/user'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setUser } from '@/store/slices/authSlice'

interface UseProfileResult {
  profile: UserProfile | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  saveError: string | null
  updateProfile: (payload: UpdateUserPayload) => Promise<UserProfile | null>
}

export function useProfile(): UseProfileResult {
  const dispatch = useAppDispatch()
  const cached = useAppSelector((state) => state.auth.user)
  const [profile, setProfile] = useState<UserProfile | null>(cached)
  const [isLoading, setIsLoading] = useState(cached === null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getMe()
        if (!cancelled) {
          setProfile(data)
          dispatch(setUser(data))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [dispatch])

  const updateProfile = useCallback(
    async (payload: UpdateUserPayload): Promise<UserProfile | null> => {
      try {
        setIsSaving(true)
        setSaveError(null)
        const updated = await updateMe(payload)
        setProfile(updated)
        dispatch(setUser(updated))
        return updated
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to update profile')
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [dispatch]
  )

  return { profile, isLoading, isSaving, error, saveError, updateProfile }
}
