import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from './Tabs'

const tabs = [
  { id: 'a', label: 'First', content: <div>Content A</div> },
  { id: 'b', label: 'Second', content: <div>Content B</div> },
]

describe('Tabs', () => {
  it('renders first tab content by default', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByText('Content A')).toBeInTheDocument()
    expect(screen.queryByText('Content B')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true')
  })

  it('switches content when another tab is clicked', async () => {
    render(<Tabs tabs={tabs} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Second' }))
    expect(screen.getByText('Content B')).toBeInTheDocument()
    expect(screen.queryByText('Content A')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true')
  })

  it('respects defaultTab', () => {
    render(<Tabs tabs={tabs} defaultTab="b" />)
    expect(screen.getByText('Content B')).toBeInTheDocument()
  })
})
