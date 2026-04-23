// Modern pagination control driven by an API meta object.
export default function Pagination({ meta, onPageChange }) {
  if (!meta) return null;

  const { current_page, last_page, per_page, total } = meta;
  if (last_page <= 1 && total <= per_page) return null;

  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total);

  // Generate page numbers to show (with optional elipsis in future, but simple for now)
  const pages = [];
  for (let i = 1; i <= last_page; i += 1) pages.push(i);

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
      <div className="text-secondary small">
        Showing <span className="fw-bold text-dark">{start}</span> to <span className="fw-bold text-dark">{end}</span> of <span className="fw-bold text-dark">{total}</span> entries
      </div>

      <nav aria-label="Table navigation">
        <ul className="pagination pagination-sm m-0 shadow-sm border rounded">
          <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link px-3"
              onClick={() => onPageChange(current_page - 1)}
              disabled={current_page === 1}
            >
              Previous
            </button>
          </li>

          {pages.map((p) => (
            <li key={p} className={`page-item ${current_page === p ? 'active' : ''}`}>
              <button
                type="button"
                className="page-link fw-bold"
                style={{ minWidth: '38px', textAlign: 'center' }}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </li>
          ))}

          <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link px-3"
              onClick={() => onPageChange(current_page + 1)}
              disabled={current_page === last_page}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
