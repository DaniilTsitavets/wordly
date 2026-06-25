import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { SubtopicCard } from './SubtopicCard'

const baseProps = {
  id: 7,
  title: 'Drinks',
  imageUrl: 'http://img/d.png',
  description: 'about drinks',
  wordCount: 12,
  topicTitle: 'Food & Drinks',
  status: 'unblocked' as const,
  completedMechanicsCount: 2,
  totalMechanicsCount: 5,
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

describe('SubtopicCard', () => {
  it('renders unlocked state with title, description, wordCount, Start Learning', () => {
    renderWithProviders(<SubtopicCard {...baseProps} />)
    expect(screen.getByRole('heading', { name: 'Drinks' })).toBeInTheDocument()
    expect(screen.getByText('about drinks')).toBeInTheDocument()
    expect(screen.getByText('12 words')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Learning/ })).toBeEnabled()
  })

  it('computes progress from completed/total mechanics', () => {
    renderWithProviders(
      <SubtopicCard {...baseProps} completedMechanicsCount={2} totalMechanicsCount={4} />
    )
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('handles totalMechanicsCount=0 without dividing by zero', () => {
    renderWithProviders(
      <SubtopicCard {...baseProps} completedMechanicsCount={0} totalMechanicsCount={0} />
    )
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders locked badge and Locked button when status=locked', () => {
    renderWithProviders(<SubtopicCard {...baseProps} status="locked" />)
    expect(screen.getByLabelText('Locked')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Locked/ })).toBeDisabled()
  })

  it('renders illustration img when imageUrl provided', () => {
    renderWithProviders(<SubtopicCard {...baseProps} />)
    expect(screen.getByRole('img', { name: 'Drinks illustration' })).toHaveAttribute(
      'src',
      'http://img/d.png'
    )
  })

  it('navigates to slugged route on Start Learning click', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<SubtopicCard {...baseProps} />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    )

    await userEvent.click(screen.getByRole('button', { name: /Start Learning/ }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/food-&-drinks/drinks/7')
  })
})
