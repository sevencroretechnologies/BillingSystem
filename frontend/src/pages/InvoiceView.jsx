import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCompany, getInvoice, invoicePdfUrl } from '../api/endpoints';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

const CURRENCY_SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL || '₹';

// Printable invoice detail page with download + print actions.
// Company details (including logo) are pulled from the backend so the
// information stays in sync with the Settings → Company page.
export default function InvoiceView() {
  const { id } = useParams();
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
              {company?.logo_url && (
                <img
                  src={company.logo_url}
                  alt="Company logo"
                  style={{ maxHeight: 72, maxWidth: 180, marginBottom: 8 }}
                />
              )}
              <h4 className="text-primary mb-1">
                {company?.company_name || 'Your Company'}
              </h4>
              {company?.address && (
                <div className="text-muted small">{company.address}</div>
              )}
              {(company?.phone || company?.email) && (
                <div className="text-muted small">
                  {company.phone}
                  {company.phone && company.email ? ' · ' : ''}
                  {company.email}
                </div>
              )}
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

          {/* Tax is applied at the invoice level; show the effective
              combined rate per line for reference. */}
          {(() => {
            const combinedTax =
              Number(invoice.sgst_percent || 0) + Number(invoice.cgst_percent || 0);
            return (
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
            );
          })()}

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
                    <td className="text-end">{money(invoice.tax_total)}</td>
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
  );
}
