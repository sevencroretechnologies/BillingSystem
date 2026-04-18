import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCompany, getInvoice, invoicePdfUrl } from '../api/endpoints';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

const CURRENCY_SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL || '₹';

// Printable invoice detail page with download + print actions.
// Company details (including logo) are pulled from the backend so the
// information stays in sync with the Settings → Company page.
export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [inv, co] = await Promise.all([getInvoice(id), getCompany()]);
        setInvoice(inv.data.data);
        setCompany(co.data.data);
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

  const money = (n) => `${CURRENCY_SYMBOL}${Number(n || 0).toFixed(2)}`;

  // Combined tax calculation for total reference
  const combinedTax = Number(invoice.sgst_percent || 0) + Number(invoice.cgst_percent || 0);

  return (
    <div>
      {/* DESKTOP VIEW (md and above) */}
      <div className="d-none d-md-block">
        <div className="d-flex justify-content-between align-items-center mb-3 no-print">
          <h3 className="m-0">Invoice {invoice.invoice_number}</h3>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/invoices" className="btn btn-outline-secondary">
              Back
            </Link>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => window.print()}
            >
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
              <div className="col-sm-6">
                {company?.logo_url && (
                  <img
                    src={company.logo_url}
                    alt="Company logo"
                    style={{ maxHeight: 72, maxWidth: 180, marginBottom: 8 }}
                  />
                )}
                <h4 className="text-primary mb-1">{company?.company_name || 'Your Company'}</h4>
                {company?.address && <div className="text-muted small">{company.address}</div>}
                {(company?.phone || company?.email) && (
                  <div className="text-muted small">
                    {company.phone}
                    {company.phone && company.email ? ' · ' : ''}
                    {company.email}
                  </div>
                )}
              </div>
              <div className="col-sm-6 text-end">
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
              {invoice.customer?.address && <div className="small">{invoice.customer.address}</div>}
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
                    <td className="text-end">{money(it.price)}</td>
                    <td className="text-end">{combinedTax.toFixed(2)}%</td>
                    <td className="text-end">{money(it.line_total)}</td>
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
                      <td className="text-end">{money(invoice.subtotal)}</td>
                    </tr>
                    <tr>
                      <th>SGST ({Number(invoice.sgst_percent || 0).toFixed(2)}%)</th>
                      <td className="text-end">{money(invoice.sgst_amount)}</td>
                    </tr>
                    <tr>
                      <th>CGST ({Number(invoice.cgst_percent || 0).toFixed(2)}%)</th>
                      <td className="text-end">{money(invoice.cgst_amount)}</td>
                    </tr>
                    <tr>
                      <th>Total Tax</th>
                      <td className="text-end">{money(invoice.total_tax)}</td>
                    </tr>
                    <tr className="border-top">
                      <th className="fs-5">Grand Total</th>
                      <td className="text-end fs-5 fw-bold">{money(invoice.grand_total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (Below md) */}
      <div className="d-md-none p-3 space-y-4 bg-light">
        {/* ACTION BUTTONS (Top Static - 1 Row) */}
        <div className="bg-white p-3 d-flex gap-2 rounded-xl shadow-sm border no-print">
          <button
            className="btn btn-light flex-grow-1 py-2 rounded-lg fw-semibold border shadow-sm text-sm"
            onClick={() => navigate('/invoices')}
          >
            Back
          </button>
          <button
            className="btn btn-outline-primary py-2 rounded-lg fw-semibold d-flex align-items-center justify-content-center text-sm"
            style={{ flex: 1 }}
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
          >
            Edit
          </button>
          <a
            className="btn btn-outline-success py-2 rounded-lg fw-semibold d-flex align-items-center justify-content-center text-sm"
            style={{ flex: 1 }}
            href={invoicePdfUrl(invoice.id, true)}
            target="_blank"
            rel="noreferrer"
          >
            PDF
          </a>
          <button
            className="btn btn-primary flex-grow-1 py-2 rounded-lg fw-semibold shadow-sm text-sm"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="d-flex justify-content-between text-sm">
            <span className="text-secondary">Invoice #</span>
            <span className="fw-bold">{invoice.invoice_number}</span>
          </div>
          <div className="d-flex justify-content-between text-sm mt-1">
            <span className="text-secondary">Date</span>
            <span className="fw-semibold text-dark">{invoice.invoice_date}</span>
          </div>
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-secondary text-uppercase mb-2 fw-semibold tracking-wider">
            Bill To
          </p>
          <p className="fw-bold fs-5 mb-1 text-primary">{invoice.customer?.name}</p>
          {invoice.customer?.email && <p className="text-sm text-secondary mb-1">{invoice.customer.email}</p>}
          {invoice.customer?.address && (
            <p className="text-sm text-secondary mb-0 mt-2 border-top pt-2">
              {invoice.customer.address}
            </p>
          )}
        </div>

        {/* ITEMS SECTION */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-secondary text-uppercase tracking-wider">
            Items ({invoice.items.length})
          </p>
          {invoice.items.map((it, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="fw-bold text-dark fs-6" style={{ flex: 1 }}>
                  {it.item_name}
                </span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
                  {money(it.line_total)}
                </span>
              </div>
              <div className="row g-2 text-center bg-light rounded-3 p-2 border border-light-subtle">
                <div className="col-4 border-end">
                  <p className="text-secondary mb-0" style={{ fontSize: '10px' }}>
                    QTY
                  </p>
                  <p className="fw-bold text-dark mb-0 small">{it.quantity}</p>
                </div>
                <div className="col-4 border-end">
                  <p className="text-secondary mb-0" style={{ fontSize: '10px' }}>
                    PRICE
                  </p>
                  <p className="fw-bold text-dark mb-0 small">{money(it.price)}</p>
                </div>
                <div className="col-4">
                  <p className="text-secondary mb-0" style={{ fontSize: '10px' }}>
                    TAX
                  </p>
                  <p className="fw-bold text-dark mb-0 small">{combinedTax.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS SECTION */}
        <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
          <div className="d-flex justify-content-between text-secondary small">
            <span>Subtotal</span>
            <span>{money(invoice.subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between text-secondary small">
            <span>SGST ({Number(invoice.sgst_percent || 0).toFixed(0)}%)</span>
            <span>{money(invoice.sgst_amount)}</span>
          </div>
          <div className="d-flex justify-content-between text-secondary small">
            <span>CGST ({Number(invoice.cgst_percent || 0).toFixed(0)}%)</span>
            <span>{money(invoice.cgst_amount)}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold pt-3 border-top mt-2">
            <span className="text-dark">Grand Total</span>
            <span className="text-primary fs-4">{money(invoice.grand_total)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
