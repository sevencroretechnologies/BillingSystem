import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteItem, listItems } from '../api/endpoints';
import Alert from '../components/Alert';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

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
    { key: 'price', header: 'Price', render: (r) => Number(r.price).toFixed(2) },
    { key: 'tax_percent', header: 'Tax %', render: (r) => Number(r.tax_percent).toFixed(2) },
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
        <h3 className="m-0">Items</h3>
        <Link className="btn btn-primary" to="/items/new">
          + Add Item
        </Link>
      </div>

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or description"
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
        <Loading label="Loading items..." />
      ) : (
        <>
          <DataTable columns={columns} rows={rows} emptyMessage="No items yet." />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
