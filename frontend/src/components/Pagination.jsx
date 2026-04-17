// Simple pagination control driven by an API meta object.
export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const pages = [];
  for (let i = 1; i <= meta.last_page; i += 1) pages.push(i);

  return (
    <nav>
      <ul className="pagination pagination-sm justify-content-end mb-0">
        <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(meta.current_page - 1)}
            disabled={meta.current_page === 1}
          >
            Prev
          </button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item ${meta.current_page === p ? 'active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(p)}>
              {p}
            </button>
          </li>
        ))}
        <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
