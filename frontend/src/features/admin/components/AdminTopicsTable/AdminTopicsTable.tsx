import { AdminTable, type ColumnDef } from '../AdminTable'
import styles from '../AdminTable/AdminTable.module.scss'

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
    render: (item) => (
      <img src={item.icon} alt={item.name} className={styles.iconImg} />
    ),
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

interface AdminTopicsTableProps {
  topics: TopicRow[]
  onEdit?: (topic: TopicRow) => void
  onDelete?: (topic: TopicRow) => void
}

export const AdminTopicsTable = ({ topics, onEdit, onDelete }: AdminTopicsTableProps) => {
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
