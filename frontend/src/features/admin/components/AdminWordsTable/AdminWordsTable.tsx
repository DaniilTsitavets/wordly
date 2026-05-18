import { AdminTable, type ColumnDef } from '../AdminTable'

interface WordRow {
  id: number
  image: string
  english: string
  russian: string
  topic: string
  interval: string
}

const columns: ColumnDef<WordRow>[] = [
  {
    key: 'image',
    header: 'Image',
    width: '5rem',
    render: (item) => <span style={{ fontSize: '1.5rem' }}>{item.image}</span>,
  },
  {
    key: 'english',
    header: 'English',
    render: (item) => <strong>{item.english}</strong>,
  },
  {
    key: 'russian',
    header: 'Russian',
    render: (item) => item.russian,
  },
  {
    key: 'topic',
    header: 'Topic',
    render: (item) => item.topic,
  },
  {
    key: 'interval',
    header: 'Interval',
    render: (item) => item.interval,
  },
]

const mockWords: WordRow[] = [
  {
    id: 1,
    image: '🥗',
    english: 'Salad',
    russian: 'салат',
    topic: 'Food & Drinks',
    interval: '+1d',
  },
  {
    id: 2,
    image: '🥖',
    english: 'Bread',
    russian: 'хлеб',
    topic: 'Food & Drinks',
    interval: '+1d',
  },
  {
    id: 3,
    image: '🧀',
    english: 'Cheese',
    russian: 'сыр',
    topic: 'Food & Drinks',
    interval: '+3d',
  },
]

interface AdminWordsTableProps {
  words?: WordRow[]
  onEdit?: (word: WordRow) => void
  onDelete?: (word: WordRow) => void
}

export const AdminWordsTable = ({ words = mockWords, onEdit, onDelete }: AdminWordsTableProps) => {
  return (
    <AdminTable<WordRow>
      columns={columns}
      data={words}
      getKey={(item) => item.id}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
