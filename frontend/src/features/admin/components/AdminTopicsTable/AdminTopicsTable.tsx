import { AdminTable, type ColumnDef } from '../AdminTable'

export type TopicRow = {
  id: number
  icon: string
  name: string
  description: string
  wordsCount: number
}

const columns: ColumnDef<TopicRow>[] = [
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

// Example mock data — replace with real data source
const mockTopics: TopicRow[] = [
  {
    id: 1,
    icon: '🥗',
    name: 'Food & Drinks',
    description: 'Essential vocabulary for dining and cooking',
    wordsCount: 10,
  },
  {
    id: 2,
    icon: '✈️',
    name: 'Travel',
    description: 'Words for getting around and exploring',
    wordsCount: 8,
  },
  { id: 3, icon: '🏠', name: 'Home', description: 'Household items and rooms', wordsCount: 12 },
]

interface AdminTopicsTableProps {
  topics?: TopicRow[]
  onEdit?: (topic: TopicRow) => void
  onDelete?: (topic: TopicRow) => void
}

export const AdminTopicsTable = ({
  topics = mockTopics,
  onEdit,
  onDelete,
}: AdminTopicsTableProps) => {
  return (
    <AdminTable<TopicRow>
      columns={columns}
      data={topics}
      getKey={(item) => item.id}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
