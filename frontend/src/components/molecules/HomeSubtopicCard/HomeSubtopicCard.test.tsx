import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { HomeSubtopicCard } from './HomeSubtopicCard'

const baseProps = {
  id: 7,
  title: 'Drinks',
  description: 'd',
  imageUrl: 'http://img/d.png',
  wordCount: 12,
  topicTitle: 'Food & Drinks',
  isLocked: false,
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

describe('HomeSubtopicCard', () => {
  it('renders title, description, wordCount and hero image when unlocked', () => {
    const { container } = renderWithProviders(<HomeSubtopicCard {...baseProps} />)
    expect(screen.getByRole('heading', { name: 'Drinks' })).toBeInTheDocument()
    expect(screen.getByText('d')).toBeInTheDocument()
    expect(screen.getByText('12 words')).toBeInTheDocument()
    // The hero image is decorative (alt=""), so it's outside the a11y tree —
    // query it via the DOM directly.
    expect(container.querySelector('img')).toHaveAttribute('src', 'http://img/d.png')
    expect(screen.getByRole('button', { name: /Start Learning/ })).toBeEnabled()
  })

  it('renders Locked button + locked label when isLocked', () => {
    renderWithProviders(<HomeSubtopicCard {...baseProps} isLocked />)
    expect(screen.getByRole('button', { name: /Locked/ })).toBeDisabled()
    expect(screen.getByLabelText('Drinks (locked)')).toBeInTheDocument()
  })

  it('shows fallback text when imageUrl is empty', () => {
    const { container } = renderWithProviders(<HomeSubtopicCard {...baseProps} imageUrl="" />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getAllByText('Drinks').length).toBeGreaterThan(0)
  })

  it('navigates to the slugged subtopic route on Start Learning click', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<HomeSubtopicCard {...baseProps} />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    )

    await userEvent.click(screen.getByRole('button', { name: /Start Learning/ }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/food-&-drinks/drinks/7')
  })
})
