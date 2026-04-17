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

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-auto">
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
          <DataTable columns={columns} rows={rows} emptyMessage="No customers yet." />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
