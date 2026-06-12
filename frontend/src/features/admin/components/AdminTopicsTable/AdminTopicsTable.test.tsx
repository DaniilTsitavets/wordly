import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminTopicsTable, type TopicRow } from './AdminTopicsTable'

const rows: TopicRow[] = [
  { id: 1, icon: 'http://img/food.png', name: 'Food', description: 'about food', wordsCount: 12 },
  {
    id: 2,
    icon: 'http://img/num.png',
    name: 'Numbers',
    description: 'count',
    wordsCount: 8,
  },
]

describe('AdminTopicsTable', () => {
  it('renders header columns Icon / Name / Description / Words', () => {
    render(<AdminTopicsTable topics={rows} />)
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Words')).toBeInTheDocument()
  })

  it('renders each row name, description, "N words"', () => {
    render(<AdminTopicsTable topics={rows} />)
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('about food')).toBeInTheDocument()
    expect(screen.getByText('12 words')).toBeInTheDocument()
    expect(screen.getByText('Numbers')).toBeInTheDocument()
    expect(screen.getByText('8 words')).toBeInTheDocument()
  })

  it('renders icon imgs with alt = topic name', () => {
    render(<AdminTopicsTable topics={rows} />)
    expect(screen.getByAltText('Food')).toHaveAttribute('src', 'http://img/food.png')
    expect(screen.getByAltText('Numbers')).toHaveAttribute('src', 'http://img/num.png')
  })

  it('forwards onEdit / onDelete to AdminTable', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<AdminTopicsTable topics={rows} onEdit={onEdit} onDelete={onDelete} />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1])
    expect(onEdit).toHaveBeenCalledWith(rows[1])

    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    expect(onDelete).toHaveBeenCalledWith(rows[0])
  })
})
