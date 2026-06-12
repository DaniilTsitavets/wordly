import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminSubtopicsTable, type SubtopicRow } from './AdminSubtopicsTable'

const rows: SubtopicRow[] = [
  { id: 10, icon: 'http://img/d.png', name: 'Drinks', description: 'd', wordsCount: 5 },
  {
    id: 11,
    icon: 'http://img/desserts.png',
    name: 'Desserts',
    description: 'sweet',
    wordsCount: 3,
  },
]

describe('AdminSubtopicsTable', () => {
  it('renders the rows', () => {
    render(<AdminSubtopicsTable subtopics={rows} />)
    expect(screen.getByText('Drinks')).toBeInTheDocument()
    expect(screen.getByText('Desserts')).toBeInTheDocument()
    expect(screen.getByText('5 words')).toBeInTheDocument()
    expect(screen.getByText('3 words')).toBeInTheDocument()
  })

  it('renders icon images with correct alt and src', () => {
    render(<AdminSubtopicsTable subtopics={rows} />)
    expect(screen.getByAltText('Drinks')).toHaveAttribute('src', 'http://img/d.png')
    expect(screen.getByAltText('Desserts')).toHaveAttribute('src', 'http://img/desserts.png')
  })

  it('forwards onEdit / onDelete', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<AdminSubtopicsTable subtopics={rows} onEdit={onEdit} onDelete={onDelete} />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    expect(onEdit).toHaveBeenCalledWith(rows[0])

    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1])
    expect(onDelete).toHaveBeenCalledWith(rows[1])
  })
})
