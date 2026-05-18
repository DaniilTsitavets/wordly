import { AdminTable, type ColumnDef } from '../AdminTable'

export type SubtopicRow = {
  id: number
  icon: string
  name: string
  description: string
  wordsCount: number
}

const columns: ColumnDef<SubtopicRow>[] = [
  {
    key: 'icon',
    header: 'Icon',
    width: '3.5rem',
    render: (item) => <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>,
  },
  {
    key: 'name',
    header: 'Name',
    width: '8rem',
    render: (item) => <strong>{item.name}</strong>,
  },
  {
    key: 'description',
    header: 'Description',
    maxWidth: '16.5625rem',
    render: (item) => item.description,
  },
  {
    key: 'words',
    header: 'Words',
    width: '5rem',
    render: (item) => `${item.wordsCount} words`,
  },
]

const mockSubtopics: SubtopicRow[] = [
  { id: 1, icon: '🥗', name: 'Salads', description: 'Fresh and healthy salads', wordsCount: 5 },
  { id: 2, icon: '🍞', name: 'Bakery', description: 'Bread and pastries', wordsCount: 4 },
  { id: 3, icon: '🥛', name: 'Dairy', description: 'Milk, cheese and yogurt', wordsCount: 6 },
]

interface AdminSubtopicsTableProps {
  subtopics?: SubtopicRow[]
  onEdit?: (subtopic: SubtopicRow) => void
  onDelete?: (subtopic: SubtopicRow) => void
}

export const AdminSubtopicsTable = ({
  subtopics = mockSubtopics,
  onEdit,
  onDelete,
}: AdminSubtopicsTableProps) => {
  return (
    <AdminTable<SubtopicRow>
      columns={columns}
      data={subtopics}
      getKey={(item) => item.id}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
