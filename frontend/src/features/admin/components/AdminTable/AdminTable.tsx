import styles from './AdminTable.module.scss'

export interface ColumnDef<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  width?: string
  maxWidth?: string
}

interface AdminTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  getKey: (item: T) => string | number
}

export function AdminTable<T>({ columns, data, onEdit, onDelete, getKey }: AdminTableProps<T>) {
  const hasActions = Boolean(onEdit || onDelete)

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        {columns.map((col) => {
          const style: React.CSSProperties = {}
          if (col.width) {
            style.width = col.width
            style.flex = 'none'
          }
          if (col.maxWidth) {
            style.maxWidth = col.maxWidth
          }
          return (
            <span key={col.key} className={styles.headerCell} style={style}>
              {col.header}
            </span>
          )
        })}
        {hasActions && (
          <span className={`${styles.headerCell} ${styles.actionsCell}`}>Actions</span>
        )}
      </div>
      <ul className={styles.list}>
        {data.map((item) => (
          <li key={getKey(item)} className={styles.row} tabIndex={0}>
            {columns.map((col) => {
              const style: React.CSSProperties = {}
              if (col.width) {
                style.width = col.width
                style.flex = 'none'
              }
              if (col.maxWidth) {
                style.maxWidth = col.maxWidth
              }
              return (
                <span key={col.key} className={styles.cell} style={style}>
                  {col.render(item)}
                </span>
              )
            })}
            {hasActions && (
              <span className={`${styles.actions} ${styles.actionsCell}`}>
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
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
