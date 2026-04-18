import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteCustomer, listCustomers } from '../api/endpoints';
import Alert from '../components/Alert';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

// Customer list page with search + pagination + delete action.
export default function CustomerList() {
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
      const res = await listCustomers({ search, page, per_page: 10 });
      setRows(res.data.data);
      setMeta(res.data.meta);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load customers.');
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
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete customer.');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'address', header: 'Address' },
    {
      key: 'actions',
      header: 'Actions',
      style: { width: 170 },
      render: (row) => (
        <div className="d-flex gap-2">
          <Link className="btn btn-sm btn-outline-primary" to={`/customers/${row.id}/edit`}>
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
        <h3 className="m-0">Customers</h3>
        <Link className="btn btn-primary" to="/customers/new">
          + Add Customer
        </Link>
      </div>

      <form className="mb-3" onSubmit={handleSearch}>
        <div className="d-flex gap-2" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone or email"
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
        <Loading label="Loading customers..." />
      ) : (
        <>
          {/* Desktop/Tablet View */}
          <div className="d-none d-md-block">
            <DataTable columns={columns} rows={rows} emptyMessage="No customers yet." />
          </div>

          {/* Mobile Card View */}
          <div className="d-block d-md-none">
            {rows.length === 0 ? (
              <div className="text-center py-4 text-muted">No customers yet.</div>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="card shadow-sm mb-3">
                  <div className="card-body">
                    <h5 className="card-title mb-2">{row.name}</h5>
                    <div className="mb-3 text-muted small">
                      <div className="d-flex gap-3 mb-1 flex-wrap">
                        {row.phone && <div><strong>Phone:</strong> {row.phone}</div>}
                        {row.email && <div><strong>Email:</strong> {row.email}</div>}
                      </div>
                      {row.address && <div><strong>Address:</strong> {row.address}</div>}
                    </div>
                    <div className="d-flex gap-2">
                      <Link className="btn btn-sm btn-outline-primary flex-fill" to={`/customers/${row.id}/edit`}>
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
