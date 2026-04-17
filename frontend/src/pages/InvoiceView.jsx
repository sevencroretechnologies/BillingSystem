import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInvoice, invoicePdfUrl } from '../api/endpoints';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

// Printable invoice detail page with download + print actions.
export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getInvoice(id);
        setInvoice(res.data.data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load invoice.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loading label="Loading invoice..." />;
  if (error) return <Alert message={error} />;
  if (!invoice) return null;

  const company = {
    name: import.meta.env.VITE_COMPANY_NAME || 'Your Company Pvt. Ltd.',
    address: import.meta.env.VITE_COMPANY_ADDRESS || '123 Business Street, City',
    phone: import.meta.env.VITE_COMPANY_PHONE || '+00 0000 0000',
    email: import.meta.env.VITE_COMPANY_EMAIL || 'billing@example.com',
    currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || '₹',
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <h3 className="m-0">Invoice {invoice.invoice_number}</h3>
        <div className="d-flex gap-2">
          <Link to="/invoices" className="btn btn-outline-secondary">
            Back
          </Link>
          <button type="button" className="btn btn-outline-primary" onClick={() => window.print()}>
            Print
          </button>
          <a
            className="btn btn-success"
            href={invoicePdfUrl(invoice.id, true)}
            target="_blank"
            rel="noreferrer"
          >
            Download PDF
          </a>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body invoice-print">
          <div className="row mb-4">
            <div className="col-6">
              <h4 className="text-primary mb-1">{company.name}</h4>
              <div className="text-muted small">{company.address}</div>
              <div className="text-muted small">
                {company.phone} · {company.email}
              </div>
            </div>
            <div className="col-6 text-end">
              <h2 className="m-0">INVOICE</h2>
              <div className="small text-muted mt-2">
                <strong>Invoice #:</strong> {invoice.invoice_number}
              </div>
              <div className="small text-muted">
                <strong>Date:</strong> {invoice.invoice_date}
              </div>
            </div>
          </div>

          <div className="p-3 bg-light rounded mb-4">
            <div className="text-uppercase small text-muted">Bill To</div>
            <div className="fw-bold">{invoice.customer?.name}</div>
            {invoice.customer?.phone && <div className="small">{invoice.customer.phone}</div>}
            {invoice.customer?.email && <div className="small">{invoice.customer.email}</div>}
            {invoice.customer?.address && (
              <div className="small">{invoice.customer.address}</div>
            )}
          </div>

          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Item</th>
                <th className="text-end" style={{ width: 80 }}>
                  Qty
                </th>
                <th className="text-end" style={{ width: 110 }}>
                  Price
                </th>
                <th className="text-end" style={{ width: 80 }}>
                  Tax %
                </th>
                <th className="text-end" style={{ width: 120 }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td>{it.item_name}</td>
                  <td className="text-end">{it.quantity}</td>
                  <td className="text-end">
                    {company.currencySymbol}
                    {Number(it.price).toFixed(2)}
                  </td>
                  <td className="text-end">{Number(it.tax_percent).toFixed(2)}%</td>
                  <td className="text-end">
                    {company.currencySymbol}
                    {Number(it.line_total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="row">
            <div className="col-md-7">
              {invoice.notes && (
                <div>
                  <div className="text-uppercase small text-muted">Notes</div>
                  <div>{invoice.notes}</div>
                </div>
              )}
            </div>
            <div className="col-md-5">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <th>Subtotal</th>
                    <td className="text-end">
                      {company.currencySymbol}
                      {Number(invoice.subtotal).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <th>Tax</th>
                    <td className="text-end">
                      {company.currencySymbol}
                      {Number(invoice.tax_total).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-top">
                    <th className="fs-5">Grand Total</th>
                    <td className="text-end fs-5 fw-bold">
                      {company.currencySymbol}
                      {Number(invoice.grand_total).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
