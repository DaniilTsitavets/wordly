import { AdminTable, type ColumnDef } from '../AdminTable'

export type WordRow = {
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
    width: '3.5rem',
    render: (item) => <span style={{ fontSize: '1.5rem' }}>{item.image}</span>,
  },
  {
    key: 'english',
    header: 'English',
    width: '7rem',
    render: (item) => <strong>{item.english}</strong>,
  },
  {
    key: 'russian',
    header: 'Russian',
    width: '7rem',
    render: (item) => item.russian,
  },
  {
    key: 'topic',
    header: 'Topic',
    render: (item) => (
      <span
        style={{
          fontSize: '0.775rem',
          lineHeight: '1.3125rem',
          color: '#5A5C5C',
          whiteSpace: 'nowrap',
        }}
      >
        {item.topic}
      </span>
    ),
  },
  {
    key: 'interval',
    header: 'Interval',
    width: '4rem',
    render: (item) => item.interval,
  },
]

interface AdminWordsTableProps {
  words: WordRow[]
  onEdit?: (word: WordRow) => void
  onDelete?: (word: WordRow) => void
}

export const AdminWordsTable = ({ words, onEdit, onDelete }: AdminWordsTableProps) => {
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
