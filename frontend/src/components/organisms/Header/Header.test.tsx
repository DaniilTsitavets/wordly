import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { Header } from './Header'

describe('Header — guest', () => {
  it('renders the Login button and calls onLoginClick', async () => {
    const onLoginClick = vi.fn()
    renderWithProviders(<Header isAuthenticated={false} onLoginClick={onLoginClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(onLoginClick).toHaveBeenCalled()
  })

  it('does NOT render nav icons when guest', () => {
    renderWithProviders(<Header isAuthenticated={false} onLoginClick={() => {}} />)
    expect(screen.queryByLabelText('Vocabulary')).not.toBeInTheDocument()
  })
})

describe('Header — authenticated', () => {
  const baseProps = {
    isAuthenticated: true as const,
    streak: 5,
    gems: 12,
    onLogout: vi.fn(),
    onProfileClick: vi.fn(),
    onVocabularyClick: vi.fn(),
    onRecallClick: vi.fn(),
    onAiChatClick: vi.fn(),
    onAdminClick: vi.fn(),
  }

  it('renders streak and gems values', () => {
    renderWithProviders(<Header {...baseProps} />)
    expect(screen.getByLabelText('Daily streak: 5')).toBeInTheDocument()
    expect(screen.getByLabelText('Total points: 12')).toBeInTheDocument()
  })

  it('hides Admin Panel by default', () => {
    renderWithProviders(<Header {...baseProps} />)
    expect(screen.queryByLabelText('Admin Panel')).not.toBeInTheDocument()
  })

  it('shows Admin Panel when isAdmin and fires onAdminClick', async () => {
    const onAdminClick = vi.fn()
    renderWithProviders(<Header {...baseProps} isAdmin onAdminClick={onAdminClick} />)
    await userEvent.click(screen.getByLabelText('Admin Panel'))
    expect(onAdminClick).toHaveBeenCalled()
  })

  it.each([
    ['Vocabulary', 'onVocabularyClick'] as const,
    ['Recall', 'onRecallClick'] as const,
    ['AI Chat', 'onAiChatClick'] as const,
  ])('clicking %s nav button fires %s', async (label, handlerKey) => {
    const handler = vi.fn()
    renderWithProviders(<Header {...baseProps} {...{ [handlerKey]: handler }} />)
    await userEvent.click(screen.getByLabelText(label))
    expect(handler).toHaveBeenCalled()
  })

  it('opens the dropdown menu when avatar is clicked', async () => {
    renderWithProviders(<Header {...baseProps} />)
    await userEvent.click(screen.getByLabelText('Перейти в профиль'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('fires onProfileClick + closes menu when Profile item is clicked', async () => {
    const onProfileClick = vi.fn()
    renderWithProviders(<Header {...baseProps} onProfileClick={onProfileClick} />)
    await userEvent.click(screen.getByLabelText('Перейти в профиль'))
    await userEvent.click(screen.getByRole('menuitem', { name: /Profile/ }))
    expect(onProfileClick).toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('fires onLogout when Log out is clicked', async () => {
    const onLogout = vi.fn()
    renderWithProviders(<Header {...baseProps} onLogout={onLogout} />)
    await userEvent.click(screen.getByLabelText('Перейти в профиль'))
    await userEvent.click(screen.getByRole('menuitem', { name: /Log out/ }))
    expect(onLogout).toHaveBeenCalled()
  })

  it('closes the dropdown when clicking outside', async () => {
    renderWithProviders(<Header {...baseProps} />)
    await userEvent.click(screen.getByLabelText('Перейти в профиль'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
