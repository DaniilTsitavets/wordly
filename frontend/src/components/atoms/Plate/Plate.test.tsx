import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Plate } from './Plate'

describe('Plate', () => {
  it('renders title only', () => {
    render(<Plate title="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<Plate title="T" description="D" />)
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('renders the icon slot when provided', () => {
    render(<Plate title="T" icon={<span data-testid="i" />} />)
    expect(screen.getByTestId('i')).toBeInTheDocument()
  })
})
