import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>X</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows spinner and hides children when isLoading', () => {
    render(<Button isLoading>Save</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).not.toHaveTextContent('Save')
  })

  it('renders leftIcon and rightIcon', () => {
    render(
      <Button leftIcon={<span data-testid="L" />} rightIcon={<span data-testid="R" />}>
        Mid
      </Button>
    )
    expect(screen.getByTestId('L')).toBeInTheDocument()
    expect(screen.getByTestId('R')).toBeInTheDocument()
  })

  it('does not render icons while loading', () => {
    render(
      <Button isLoading leftIcon={<span data-testid="L" />}>
        Mid
      </Button>
    )
    expect(screen.queryByTestId('L')).not.toBeInTheDocument()
  })
})
