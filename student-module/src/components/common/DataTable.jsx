export default function DataTable({ columns, rows, keyField = 'id', emptyMessage = 'No records found.' }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-ink-soft py-6 text-center">{emptyMessage}</p>
  }
  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left">
            {columns.map((col) => (
              <th key={col.key} className="px-5 sm:px-3 py-2.5 font-medium text-ink-soft whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-surface-border last:border-0 hover:bg-surface-sunk/60 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-5 sm:px-3 py-3 text-ink whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
