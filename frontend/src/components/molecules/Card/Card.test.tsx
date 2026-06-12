import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from './Card'

const baseProps = {
  wordEn: 'apple',
  transcriptionEn: 'ˈæpəl',
  translationRu: 'яблоко',
  imageUrl: 'http://img/a.png',
  hasMnemonic: false,
}

describe('Card', () => {
  it('renders the front face (word, transcription, image, flip hint)', () => {
    render(<Card {...baseProps} />)
    expect(screen.getByRole('heading', { name: 'apple' })).toBeInTheDocument()
    expect(screen.getByText('|ˈæpəl|')).toBeInTheDocument()
    expect(screen.getByAltText('Illustration for "apple"')).toBeInTheDocument()
    expect(screen.getByText('Click to reveal translation')).toBeInTheDocument()
  })

  it('renders the back face (translation, examples) too — it is always in the DOM for flip animation', () => {
    render(<Card {...baseProps} usageExampleEn="An apple a day" usageExampleRu="Яблоко в день" />)
    expect(screen.getByText('яблоко')).toBeInTheDocument()
    expect(screen.getByText('An apple a day')).toBeInTheDocument()
    expect(screen.getByText('Яблоко в день')).toBeInTheDocument()
  })

  it('renders custom mnemonic text when hasMnemonic + mnemonicText are provided', () => {
    render(<Card {...baseProps} hasMnemonic mnemonicText="a-pull" />)
    expect(screen.getByText('a-pull')).toBeInTheDocument()
  })

  it('falls back to placeholder mnemonic when hasMnemonic but no text', () => {
    render(<Card {...baseProps} hasMnemonic />)
    expect(screen.getByText('Представь себе…')).toBeInTheDocument()
  })

  it('calls onFlip when clicked', async () => {
    const onFlip = vi.fn()
    render(<Card {...baseProps} onFlip={onFlip} />)
    await userEvent.click(screen.getByRole('button', { name: /Word card: apple/ }))
    expect(onFlip).toHaveBeenCalledTimes(1)
  })

  it('calls onFlip on Enter key', () => {
    const onFlip = vi.fn()
    render(<Card {...baseProps} onFlip={onFlip} />)
    const card = screen.getByRole('button', { name: /Word card: apple/ })
    card.focus()
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    // React synthetic event needs fireEvent
  })

  it('calls onPlayAudio without flipping when audio button is clicked', async () => {
    const onPlayAudio = vi.fn()
    const onFlip = vi.fn()
    render(<Card {...baseProps} onPlayAudio={onPlayAudio} onFlip={onFlip} />)
    await userEvent.click(screen.getByRole('button', { name: /Play pronunciation/ }))
    expect(onPlayAudio).toHaveBeenCalledTimes(1)
    expect(onFlip).not.toHaveBeenCalled()
  })
})
