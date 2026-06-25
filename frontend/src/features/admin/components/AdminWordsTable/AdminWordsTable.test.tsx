import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminWordsTable, type WordRow } from './AdminWordsTable'

const rows: WordRow[] = [
  { id: 100, image: 'http://img/a.png', english: 'apple', russian: 'яблоко', topic: 'Food' },
  { id: 101, image: 'http://img/p.png', english: 'pear', russian: 'груша', topic: 'Food' },
]

describe('AdminWordsTable', () => {
  it('renders header columns Image / English / Russian / Topic', () => {
    render(<AdminWordsTable words={rows} />)
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Russian')).toBeInTheDocument()
    expect(screen.getByText('Topic')).toBeInTheDocument()
  })

  it('renders english + russian + topic per row', () => {
    render(<AdminWordsTable words={rows} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('яблоко')).toBeInTheDocument()
    expect(screen.getByText('pear')).toBeInTheDocument()
    expect(screen.getByText('груша')).toBeInTheDocument()
    expect(screen.getAllByText('Food')).toHaveLength(2)
  })

  it('uses english as alt text for image', () => {
    render(<AdminWordsTable words={rows} />)
    expect(screen.getByAltText('apple')).toHaveAttribute('src', 'http://img/a.png')
  })

  it('forwards edit + delete callbacks', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<AdminWordsTable words={rows} onEdit={onEdit} onDelete={onDelete} />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    expect(onEdit).toHaveBeenCalledWith(rows[0])

    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1])
    expect(onDelete).toHaveBeenCalledWith(rows[1])
  })
})
