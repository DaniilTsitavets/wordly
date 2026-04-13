import type { CSSProperties, HTMLAttributes } from 'react'

interface IconFontProps extends HTMLAttributes<HTMLSpanElement> {
  name: string
  size?: number | string
  color?: string
  ariaLabel?: string
  decorative?: boolean
}

export const IconFont = ({
  name,
  size = 24,
  color,
  ariaLabel,
  decorative = false,
  className = '',
  style,
  ...props
}: IconFontProps) => {
  const computedStyle: CSSProperties = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    color,
    ...style,
  }

  const isDecorative = decorative || !ariaLabel

  return (
    <span
      className={`icon icon-${name} ${className}`.trim()}
      style={computedStyle}
      aria-label={isDecorative ? undefined : ariaLabel}
      aria-hidden={isDecorative}
      {...props}
    />
  )
}
