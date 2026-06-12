import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LetterTile } from './LetterTile'

describe('LetterTile', () => {
  it('renders the letter', () => {
    render(<LetterTile letter="A" />)
    expect(screen.getByRole('button', { name: 'Letter A' })).toHaveTextContent('A')
  })

  it('is aria-pressed when state=correct', () => {
    render(<LetterTile letter="A" state="correct" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('is not aria-pressed by default', () => {
    render(<LetterTile letter="A" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<LetterTile letter="A" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
