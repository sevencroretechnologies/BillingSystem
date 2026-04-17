import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteInvoice, invoicePdfUrl, listInvoices } from '../api/endpoints';
import Alert from '../components/Alert';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

// Invoice list with search by invoice number/customer name and date range.
export default function InvoiceList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({ search: '', from_date: '', to_date: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listInvoices({ ...filters, page, per_page: 10 });
      setRows(res.data.data);
      setMeta(res.data.meta);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load invoices.');
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
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete invoice.');
    }
  };

  const columns = [
    { key: 'invoice_number', header: 'Invoice #' },
    { key: 'invoice_date', header: 'Date' },
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || '—' },
    {
      key: 'grand_total',
      header: 'Total',
      render: (r) => Number(r.grand_total).toFixed(2),
    },
    {
      key: 'actions',
      header: 'Actions',
      style: { width: 260 },
      render: (row) => (
        <div className="d-flex gap-2 flex-wrap">
          <Link className="btn btn-sm btn-outline-primary" to={`/invoices/${row.id}`}>
            View
          </Link>
          <a
            className="btn btn-sm btn-outline-success"
            href={invoicePdfUrl(row.id, true)}
            target="_blank"
            rel="noreferrer"
          >
            PDF
          </a>
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
        <h3 className="m-0">Invoices</h3>
        <Link className="btn btn-primary" to="/invoices/new">
          + New Invoice
        </Link>
      </div>

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by invoice # or customer"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={filters.from_date}
            onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={filters.to_date}
            onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-outline-secondary">
            Filter
          </button>
        </div>
      </form>

      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <Loading label="Loading invoices..." />
      ) : (
        <>
          <DataTable columns={columns} rows={rows} emptyMessage="No invoices yet." />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
