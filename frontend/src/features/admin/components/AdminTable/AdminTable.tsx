import styles from './AdminTable.module.scss'

export interface ColumnDef<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  width?: string
}

interface AdminTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  getKey: (item: T) => string | number
}

export function AdminTable<T>({ columns, data, onEdit, onDelete, getKey }: AdminTableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={getKey(item)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(item)}</td>
              ))}
              {(onEdit || onDelete) && (
                <td className={styles.actions}>
                  {onEdit && (
                    <button className={styles.editBtn} onClick={() => onEdit(item)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button className={styles.deleteBtn} onClick={() => onDelete(item)}>
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
