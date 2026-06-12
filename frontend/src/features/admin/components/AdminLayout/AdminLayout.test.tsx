import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { AdminLayout } from './AdminLayout'

describe('AdminLayout', () => {
  it('renders the sidebar + Outlet content', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<div>Dashboard Body</div>} />
        </Route>
      </Routes>,
      { route: '/admin/dashboard' }
    )

    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Body')).toBeInTheDocument()
  })
})
