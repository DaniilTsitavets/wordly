import { AdminTable, type ColumnDef } from '../AdminTable'
import styles from '../AdminTable/AdminTable.module.scss'

export type WordRow = {
  id: number
  image: string
  english: string
  russian: string
  topic: string
}

const columns: ColumnDef<WordRow>[] = [
  {
    key: 'image',
    header: 'Image',
    width: '3.5rem',
    render: (item) => <img src={item.image} alt={item.english} className={styles.iconImg} />,
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
    render: (item) => <span className={styles.topicLabel}>{item.topic}</span>,
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
