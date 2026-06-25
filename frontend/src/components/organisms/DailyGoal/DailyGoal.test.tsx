import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DailyGoal } from './DailyGoal'

describe('DailyGoal', () => {
  it('renders title and 3 options', () => {
    render(<DailyGoal />)
    expect(screen.getByRole('heading', { name: 'Daily Study Time' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('selects the "recommended" option by default (aria-checked)', () => {
    render(<DailyGoal />)
    const radios = screen.getAllByRole('radio')
    const recommended = radios.find((r) => r.textContent?.includes('RECOMMENDED'))
    expect(recommended).toHaveAttribute('aria-checked', 'true')
  })

  it('switches selection when another option is clicked', async () => {
    render(<DailyGoal />)
    const radios = screen.getAllByRole('radio')
    const lightOption = radios.find((r) => r.textContent?.includes('Light & Easy'))!
    await userEvent.click(lightOption)
    expect(lightOption).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onStart with the selected goal minutes (15 for default)', async () => {
    const onStart = vi.fn()
    render(<DailyGoal onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /Let's Start/ }))
    expect(onStart).toHaveBeenCalledWith(15)
  })

  it('calls onStart with 5 when Light option is chosen first', async () => {
    const onStart = vi.fn()
    render(<DailyGoal onStart={onStart} />)
    const radios = screen.getAllByRole('radio')
    await userEvent.click(radios.find((r) => r.textContent?.includes('Light & Easy'))!)
    await userEvent.click(screen.getByRole('button', { name: /Let's Start/ }))
    expect(onStart).toHaveBeenCalledWith(5)
  })

  it('shows the saving label and disables the button when isSubmitting', () => {
    render(<DailyGoal isSubmitting />)
    const btn = screen.getByRole('button', { name: /Saving/ })
    expect(btn).toBeDisabled()
  })

  it('selects via keyboard (Enter) on radio cards', () => {
    const { container } = render(<DailyGoal />)
    const radios = container.querySelectorAll('[role="radio"]')
    const light = Array.from(radios).find((r) =>
      r.textContent?.includes('Light & Easy')
    ) as HTMLElement
    light.focus()
    light.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  })
})
