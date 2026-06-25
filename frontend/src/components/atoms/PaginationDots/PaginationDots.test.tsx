import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaginationDots } from './PaginationDots'

describe('PaginationDots', () => {
  it('renders 3 dots by default with default loading label', () => {
    const { container } = render(<PaginationDots />)
    expect(container.querySelectorAll('span[class*="dot"]')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Загрузка...')
  })

  it('renders the requested number of dots', () => {
    const { container } = render(<PaginationDots total={5} />)
    expect(container.querySelectorAll('span[class*="dot"]')).toHaveLength(5)
  })

  it('uses custom label and renders visible text', () => {
    render(<PaginationDots label="Loading topics" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading topics')
    expect(screen.getByText('Loading topics')).toBeInTheDocument()
  })
})
