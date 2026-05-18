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

interface AdminSubtopicsTableProps {
  subtopics: SubtopicRow[]
  onEdit?: (subtopic: SubtopicRow) => void
  onDelete?: (subtopic: SubtopicRow) => void
}

export const AdminSubtopicsTable = ({ subtopics, onEdit, onDelete }: AdminSubtopicsTableProps) => {
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
