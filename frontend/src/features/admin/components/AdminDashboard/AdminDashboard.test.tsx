import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminDashboard } from './AdminDashboard'

describe('AdminDashboard', () => {
  it('renders title + three stat cards', () => {
    render(<AdminDashboard />)
    expect(screen.getByRole('heading', { name: 'Dashboard Overview' })).toBeInTheDocument()
    expect(screen.getByText('Total Topics')).toBeInTheDocument()
    expect(screen.getByText('Total Words')).toBeInTheDocument()
    expect(screen.getByText('Avg Words/Topic')).toBeInTheDocument()
  })

  it('renders the recent activity section', () => {
    render(<AdminDashboard />)
    expect(screen.getByRole('heading', { name: 'Recent Activity' })).toBeInTheDocument()
    expect(screen.getByText('Topic Created')).toBeInTheDocument()
    expect(screen.getByText('Food & Drinks added')).toBeInTheDocument()
  })
})
