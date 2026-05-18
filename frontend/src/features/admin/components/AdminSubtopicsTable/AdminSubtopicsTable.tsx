import { AdminTable, type ColumnDef } from '../AdminTable'

interface SubtopicRow {
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
    width: '5rem',
    render: (item) => <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>,
  },
  {
    key: 'name',
    header: 'Name',
    render: (item) => <strong>{item.name}</strong>,
  },
  {
    key: 'description',
    header: 'Description',
    render: (item) => item.description,
  },
  {
    key: 'words',
    header: 'Words',
    render: (item) => `${item.wordsCount} words`,
  },
]

const mockSubtopics: SubtopicRow[] = [
  { id: 1, icon: 'ðŸ¥—', name: 'Salads', description: 'Fresh and healthy salads', wordsCount: 5 },
  { id: 2, icon: 'ðŸž', name: 'Bakery', description: 'Bread and pastries', wordsCount: 4 },
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
