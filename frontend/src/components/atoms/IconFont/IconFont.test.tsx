import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { IconFont } from './IconFont'

describe('IconFont', () => {
  it('applies icon-{name} class', () => {
    const { container } = render(<IconFont name="brain" />)
    expect(container.firstChild).toHaveClass('icon')
    expect(container.firstChild).toHaveClass('icon-brain')
  })

  it('converts numeric size to px', () => {
    const { container } = render(<IconFont name="brain" size={32} />)
    expect(container.firstChild).toHaveStyle({ fontSize: '32px' })
  })

  it('passes through string size as-is', () => {
    const { container } = render(<IconFont name="brain" size="1.5rem" />)
    expect(container.firstChild).toHaveStyle({ fontSize: '1.5rem' })
  })

  it('is decorative (aria-hidden) by default when no ariaLabel', () => {
    const { container } = render(<IconFont name="brain" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstChild).not.toHaveAttribute('aria-label')
  })

  it('exposes aria-label when label is provided and decorative is false', () => {
    const { container } = render(<IconFont name="brain" ariaLabel="brain icon" />)
    expect(container.firstChild).toHaveAttribute('aria-label', 'brain icon')
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'false')
  })

  it('stays decorative when decorative=true even with ariaLabel', () => {
    const { container } = render(<IconFont name="brain" ariaLabel="ignored" decorative />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstChild).not.toHaveAttribute('aria-label')
  })
})
