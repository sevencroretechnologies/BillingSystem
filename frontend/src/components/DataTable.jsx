// Generic Bootstrap table with render-prop columns and an empty state.
export default function DataTable({ columns, rows, emptyMessage = 'No records found.' }) {
  if (!rows || rows.length === 0) {
    return <div className="text-center text-muted py-4">{emptyMessage}</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.style}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
