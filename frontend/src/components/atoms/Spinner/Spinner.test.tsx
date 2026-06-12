import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders a screen-reader fallback by default', () => {
    render(<Spinner />)
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('renders the label when provided', () => {
    render(<Spinner label="Loading data" />)
    expect(screen.getByText('Loading data')).toBeInTheDocument()
  })

  it('applies size dimensions to the svg', () => {
    const { container } = render(<Spinner size="lg" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('uses small dimensions for size="sm"', () => {
    const { container } = render(<Spinner size="sm" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '80')
  })
})
