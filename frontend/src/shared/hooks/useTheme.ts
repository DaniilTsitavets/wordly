import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'

const STORAGE_KEY = 'wordly-color-theme'

type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'dark') return 'dark'
  if (preference === 'light') return 'light'
  return getSystemTheme()
}

export function applyTheme(preference: ThemePreference): void {
  const resolved = resolveTheme(preference)
  document.documentElement.setAttribute('data-theme', resolved)
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // localStorage may be unavailable (private browsing, storage quota)
  }
}


export function useTheme(): void {
  const colorTheme = useAppSelector(
    (state) => state.auth.user?.color_theme ?? 'system',
  )

  useEffect(() => {
    applyTheme(colorTheme)

    if (colorTheme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mq.addEventListener('change', handleChange)
      return () => mq.removeEventListener('change', handleChange)
    }
  }, [colorTheme])
}
