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
      style: { width: 320 },
      render: (row) => (
        <div className="d-flex gap-2 flex-wrap">
          <Link className="btn btn-sm btn-outline-primary" to={`/invoices/${row.id}`}>
            View
          </Link>
          <Link className="btn btn-sm btn-outline-secondary" to={`/invoices/${row.id}/edit`}>
            Edit
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
      {/* DESKTOP HEADER (md and above) */}
      <div className="d-none d-md-block">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">Invoices</h3>
          <Link className="btn btn-primary" to="/invoices/new">
            + New Invoice
          </Link>
        </div>
      </div>

      {/* MOBILE HEADER (Below md) */}
      <div className="d-md-none mb-3">
        <h3 className="m-0">Invoices</h3>
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
          {/* DESKTOP TABLE */}
          <div className="d-none d-md-block">
            <DataTable columns={columns} rows={rows} emptyMessage="No invoices yet." />
          </div>

          {/* MOBILE CARDS (Below md) */}
          <div className="d-md-none space-y-3 mt-3 pb-5">
            {rows.length === 0 ? (
              <div className="text-center text-secondary py-5">No invoices found</div>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
                  {/* TOP ROW: INV # & STATUS */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-xs fw-bold text-secondary text-uppercase tracking-wider">
                      #{row.invoice_number}
                    </span>
                  </div>

                  {/* CUSTOMER */}
                  <div>
                    <p className="text-xs text-secondary text-uppercase mb-1 fw-semibold tracking-wider">
                      Customer
                    </p>
                    <p className="text-sm fw-medium m-0 text-dark">
                      {row.customer?.name || '—'}
                    </p>
                  </div>

                  {/* DATE + AMOUNT */}
                  <div className="d-flex justify-content-between align-items-end text-sm">
                    <div>
                      <p className="text-xs text-secondary text-uppercase mb-1 fw-semibold tracking-wider">
                        Date
                      </p>
                      <p className="m-0 text-dark">{row.invoice_date}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-xs text-secondary text-uppercase mb-1 fw-semibold tracking-wider">
                        Amount
                      </p>
                      <p className="fw-bold text-primary m-0 fs-5">
                        ₹{Number(row.grand_total).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="d-flex justify-content-between pt-3 border-top mt-2">
                    <Link
                      to={`/invoices/${row.id}`}
                      className="btn btn-link link-primary p-0 text-decoration-none text-sm fw-semibold"
                    >
                      View
                    </Link>
                    <Link
                      to={`/invoices/${row.id}/edit`}
                      className="btn btn-link link-success p-0 text-decoration-none text-sm fw-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="btn btn-link link-danger p-0 text-decoration-none text-sm fw-semibold border-0 bg-transparent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />

          {/* FLOATING ACTION BUTTON (MOBILE ONLY) */}
          <div
            className="fixed-bottom d-md-none text-end p-4 mb-2"
            style={{ pointerEvents: 'none', zIndex: 1050 }}
          >
            <Link
              to="/invoices/new"
              className="btn btn-primary rounded-circle shadow-lg d-inline-flex align-items-center justify-content-center"
              style={{
                width: '56px',
                height: '56px',
                pointerEvents: 'auto',
                fontSize: '24px',
                paddingBottom: '4px',
              }}
            >
              +
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
