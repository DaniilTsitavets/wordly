import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders label and associates it with the input via htmlFor', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toBeInTheDocument()
    expect(input.id).toBe('email')
  })

  it('renders helperText when there is no error', () => {
    render(<Input label="Pwd" helperText="At least 8 chars" />)
    expect(screen.getByText('At least 8 chars')).toBeInTheDocument()
  })

  it('shows errorText (role=alert) and hides helperText when error is present', () => {
    render(<Input label="Pwd" helperText="hint" errorText="too short" />)
    expect(screen.getByRole('alert')).toHaveTextContent('too short')
    expect(screen.queryByText('hint')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Pwd')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders type=password initially when showPasswordToggle is on', () => {
    render(<Input label="Pwd" showPasswordToggle />)
    expect(screen.getByLabelText('Pwd')).toHaveAttribute('type', 'password')
  })

  it('toggles password visibility via the eye button', async () => {
    render(<Input label="Pwd" showPasswordToggle />)
    const input = screen.getByLabelText('Pwd')
    const toggle = screen.getByRole('button', { name: 'Показать пароль' })

    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Скрыть пароль' })).toBeInTheDocument()
  })

  it('forwards value + onChange', async () => {
    let value = ''
    render(<Input label="X" value={value} onChange={(e) => (value = e.target.value)} />)
    await userEvent.type(screen.getByLabelText('X'), 'a')
    expect(value).toBe('a')
  })
})
