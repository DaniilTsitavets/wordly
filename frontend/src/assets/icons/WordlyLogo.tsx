import { useState, useEffect } from 'react'

export const WordlyLogo = ({ height = 10 }: { height?: number }) => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return <img src={isDark ? '/logo_light.png' : '/logo.png'} alt="Wordly" style={{ height }} />
}
