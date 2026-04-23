import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteItem, listItems } from '../api/endpoints';
import Alert from '../components/Alert';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import BackButton from '../components/BackButton';

// Item/product list with search, pagination and delete.
export default function ItemList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listItems({ search, page, per_page: 10 });
      setRows(res.data.data);
      setMeta(res.data.meta);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteItem(id);
      fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete item.');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    {
      key: 'actions',
      header: 'Actions',
      style: { width: 170 },
      render: (row) => (
        <div className="d-flex gap-2">
          <Link className="btn btn-sm btn-outline-primary" to={`/items/${row.id}/edit`}>
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <BackButton />
          {/* <h3 className="m-0">Items</h3> */}
        </div>
        <Link className="btn btn-primary" to="/items/new">
          + Add Item
        </Link>
      </div>

      <form className="mb-3" onSubmit={handleSearch}>
        <div className="d-flex gap-2" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-secondary">
            Search
          </button>
        </div>
      </form>

      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="d-none d-md-block card shadow-sm border-0 p-3">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th><div className="skeleton" style={{ height: 20, width: 80 }}></div></th>
                    <th><div className="skeleton" style={{ height: 20, width: 120 }}></div></th>
                    <th><div className="skeleton" style={{ height: 20, width: 100 }}></div></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td><div className="skeleton skeleton-text" style={{ width: '60%' }}></div></td>
                      <td><div className="skeleton skeleton-text" style={{ width: '80%' }}></div></td>
                      <td><div className="skeleton skeleton-button" style={{ width: 120, height: 28 }}></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Skeleton */}
          <div className="d-md-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card shadow-sm mb-3 border-0">
                <div className="card-body">
                  <div className="skeleton mb-2" style={{ height: 24, width: '70%' }}></div>
                  <div className="skeleton mb-3" style={{ height: 16, width: '90%' }}></div>
                  <div className="d-flex gap-2">
                    <div className="skeleton flex-fill" style={{ height: 32 }}></div>
                    <div className="skeleton flex-fill" style={{ height: 32 }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Desktop/Tablet View */}
          <div className="d-none d-md-block">
            <DataTable columns={columns} rows={rows} emptyMessage="No items yet." />
          </div>

          {/* Mobile Card View */}
          <div className="d-block d-md-none">
            {rows.length === 0 ? (
              <div className="text-center py-4 text-muted">No items yet.</div>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="card shadow-sm mb-3">
                  <div className="card-body">
                    <h5 className="card-title mb-2">{row.name}</h5>
                    <p className="card-text text-muted mb-3 text-truncate">
                      {row.description || 'No description'}
                    </p>
                    <div className="d-flex gap-3 gap-md-2">
                      <Link className="btn btn-sm btn-outline-primary flex-fill" to={`/items/${row.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger flex-fill"
                        onClick={() => handleDelete(row.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
