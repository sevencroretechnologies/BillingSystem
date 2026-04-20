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
  const [viewModalData, setViewModalData] = useState(null);

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
      style: { width: 220 },
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-info"
            onClick={() => setViewModalData(row)}
          >
            View
          </button>
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
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info flex-fill"
                        onClick={() => setViewModalData(row)}
                      >
                        View
                      </button>
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

      {/* View Customer Modal */}
      {viewModalData && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewModalData(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="fw-bold d-block text-muted small uppercase">Name</label>
                  <div>{viewModalData.name}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="fw-bold d-block text-muted small uppercase">Phone</label>
                    <div>{viewModalData.phone || '-'}</div>
                  </div>
                  <div className="col-6">
                    <label className="fw-bold d-block text-muted small uppercase">Email</label>
                    <div>{viewModalData.email || '-'}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="fw-bold d-block text-muted small uppercase">Address</label>
                  <div>{viewModalData.address || '-'}</div>
                </div>
                {viewModalData.tax_number && (
                  <div className="mb-3">
                    <label className="fw-bold d-block text-muted small uppercase">Tax Number / GSTIN</label>
                    <div>{viewModalData.tax_number}</div>
                  </div>
                )}
                {viewModalData.notes && (
                  <div className="mb-3">
                    <label className="fw-bold d-block text-muted small uppercase">Notes</label>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{viewModalData.notes}</div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewModalData(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
