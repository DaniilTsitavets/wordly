import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders the image when src is provided', () => {
    render(<Avatar src="http://img/a.png" alt="me" />)
    const img = screen.getByRole('img', { name: 'me' })
    expect(img).toHaveAttribute('src', 'http://img/a.png')
  })

  it('renders the fallback letter when src is missing', () => {
    render(<Avatar fallback="J" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders a ? placeholder when both src and fallback are missing', () => {
    render(<Avatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Avatar fallback="J" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
