import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminTable, type ColumnDef } from './AdminTable'

interface Row {
  id: number
  name: string
  count: number
}

const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', render: (item) => <strong>{item.name}</strong>, width: '8rem' },
  { key: 'count', header: 'Count', render: (item) => item.count, maxWidth: '4rem' },
]

const data: Row[] = [
  { id: 1, name: 'Alpha', count: 10 },
  { id: 2, name: 'Beta', count: 20 },
]

describe('AdminTable', () => {
  it('renders headers from columns', () => {
    render(<AdminTable<Row> columns={columns} data={data} getKey={(r) => r.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Count')).toBeInTheDocument()
  })

  it('renders each row using column.render', () => {
    render(<AdminTable<Row> columns={columns} data={data} getKey={(r) => r.id} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('does NOT render the Actions column when no onEdit/onDelete provided', () => {
    render(<AdminTable<Row> columns={columns} data={data} getKey={(r) => r.id} />)
    expect(screen.queryByText('Actions')).not.toBeInTheDocument()
  })

  it('renders the Actions column when handlers are provided', () => {
    render(
      <AdminTable<Row>
        columns={columns}
        data={data}
        getKey={(r) => r.id}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    )
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2)
  })

  it('only renders Edit button when only onEdit is provided', () => {
    render(<AdminTable<Row> columns={columns} data={data} getKey={(r) => r.id} onEdit={() => {}} />)
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('fires onEdit / onDelete with the row item', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <AdminTable<Row>
        columns={columns}
        data={data}
        getKey={(r) => r.id}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    expect(onEdit).toHaveBeenCalledWith(data[0])

    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1])
    expect(onDelete).toHaveBeenCalledWith(data[1])
  })

  it('renders nothing in tbody when data is empty', () => {
    const { container } = render(
      <AdminTable<Row> columns={columns} data={[]} getKey={(r) => r.id} />
    )
    expect(container.querySelector('ul')?.children).toHaveLength(0)
  })
})
