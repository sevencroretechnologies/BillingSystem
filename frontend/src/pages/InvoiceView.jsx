import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCompany, getInvoice, invoicePdfUrl } from '../api/endpoints';
import Alert from '../components/Alert';
import BackButton from '../components/BackButton';

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

  if (loading) {
    return (
      <div className="container py-2">
        {/* Desktop Skeleton */}
        <div className="d-none d-md-block">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="skeleton" style={{ height: 32, width: 200 }}></div>
            <div className="d-flex gap-2">
              <div className="skeleton skeleton-button" style={{ width: 80 }}></div>
              <div className="skeleton skeleton-button" style={{ width: 80 }}></div>
              <div className="skeleton skeleton-button" style={{ width: 80 }}></div>
              <div className="skeleton skeleton-button" style={{ width: 120 }}></div>
            </div>
          </div>
          <div className="card shadow-sm border-0">
            <div className="card-body p-5">
              <div className="d-flex justify-content-between mb-4">
                <div className="skeleton" style={{ height: 60, width: 250 }}></div>
                <div className="skeleton" style={{ height: 40, width: 150 }}></div>
                <div className="skeleton" style={{ height: 60, width: 200 }}></div>
              </div>
              <div className="skeleton mx-auto mb-4" style={{ height: 80, width: '60%' }}></div>
              <div className="d-flex justify-content-between mb-4">
                <div className="skeleton" style={{ height: 24, width: 120 }}></div>
                <div className="skeleton" style={{ height: 24, width: 150 }}></div>
              </div>
              <div className="skeleton mb-4" style={{ height: 40, width: '40%' }}></div>
              <div className="table-responsive mb-4">
                <table className="table border">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}><div className="skeleton" style={{ height: 20 }}></div></th>
                      <th><div className="skeleton" style={{ height: 20 }}></div></th>
                      <th style={{ width: 100 }}><div className="skeleton" style={{ height: 20 }}></div></th>
                      <th style={{ width: 120 }}><div className="skeleton" style={{ height: 20 }}></div></th>
                      <th style={{ width: 140 }}><div className="skeleton" style={{ height: 20 }}></div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td><div className="skeleton skeleton-text" style={{ width: '50%', margin: '0 auto' }}></div></td>
                        <td><div className="skeleton skeleton-text" style={{ width: '80%' }}></div></td>
                        <td><div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto' }}></div></td>
                        <td><div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto' }}></div></td>
                        <td><div className="skeleton skeleton-text" style={{ width: '80%', margin: '0 0 0 auto' }}></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end mb-5">
                <div className="skeleton" style={{ height: 160, width: 250 }}></div>
              </div>
              <div className="d-flex justify-content-between align-items-end mt-5">
                <div className="skeleton" style={{ height: 60, width: '50%' }}></div>
                <div className="skeleton" style={{ height: 100, width: 200 }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Skeleton */}
        <div className="d-md-none space-y-4">
          <div className="bg-white p-3 d-flex gap-2 rounded-xl shadow-sm border">
            <div className="skeleton flex-fill" style={{ height: 36 }}></div>
            <div className="skeleton flex-fill" style={{ height: 36 }}></div>
            <div className="skeleton flex-fill" style={{ height: 36 }}></div>
            <div className="skeleton flex-fill" style={{ height: 36 }}></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="d-flex justify-content-between mb-2">
              <div className="skeleton" style={{ height: 16, width: '30%' }}></div>
              <div className="skeleton" style={{ height: 16, width: '40%' }}></div>
            </div>
            <div className="d-flex justify-content-between">
              <div className="skeleton" style={{ height: 16, width: '20%' }}></div>
              <div className="skeleton" style={{ height: 16, width: '50%' }}></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="skeleton mb-2" style={{ height: 12, width: '20%' }}></div>
            <div className="skeleton mb-3" style={{ height: 32, width: '70%' }}></div>
            <div className="skeleton pt-2 border-top" style={{ height: 40, width: '100%' }}></div>
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="d-flex justify-content-between mb-3">
                <div className="skeleton" style={{ height: 20, width: '60%' }}></div>
                <div className="skeleton" style={{ height: 20, width: '20%' }}></div>
              </div>
              <div className="skeleton" style={{ height: 50, width: '100%' }}></div>
            </div>
          ))}
          <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
            <div className="d-flex justify-content-between"><div className="skeleton" style={{ height: 14, width: '40%' }}></div><div className="skeleton" style={{ height: 14, width: '30%' }}></div></div>
            <div className="d-flex justify-content-between"><div className="skeleton" style={{ height: 14, width: '40%' }}></div><div className="skeleton" style={{ height: 14, width: '30%' }}></div></div>
            <div className="d-flex justify-content-between pt-3 border-top"><div className="skeleton" style={{ height: 20, width: '40%' }}></div><div className="skeleton" style={{ height: 28, width: '40%' }}></div></div>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <Alert message={error} />;
  if (!invoice) return null;

  const money = (n) => `${CURRENCY_SYMBOL}${Number(n || 0).toFixed(2)}`;

  // Combined tax calculation for total reference
  const combinedTax = Number(invoice.sgst_percent || 0) + Number(invoice.cgst_percent || 0);

  const numberToWords = (num) => {
    num = Math.round(num);
    if (num === 0) return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += a[n];
      }
      return str;
    };

    let words = '';
    if (Math.floor(num / 10000000) > 0) {
      words += inWords(Math.floor(num / 10000000)) + 'Crore ';
      num %= 10000000;
    }
    if (Math.floor(num / 100000) > 0) {
      words += inWords(Math.floor(num / 100000)) + 'Lakh ';
      num %= 100000;
    }
    if (Math.floor(num / 1000) > 0) {
      words += inWords(Math.floor(num / 1000)) + 'Thousand ';
      num %= 1000;
    }
    words += inWords(num);
    return words.trim() + ' Rupees Only';
  };

  const getMonthYear = (dateStr) => {
    if (!dateStr) return '';
    // Handle YYYY-MM-DD or DD-MM-YYYY
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // If it's DD-MM-YYYY
        if (parts[2].length === 4) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
    }
    if (isNaN(date.getTime())) return '';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
  };

  return (
    <div>
      <style>
        {`
          @media print {
            @page { margin: 0; }
            body { margin: 1cm; }
            .print-col-sl { width: 30px !important; }
            .print-col-qty { width: 40px !important; }
            .print-col-rate { width: 70px !important; }
            .print-col-amount { width: 80px !important; }
          }
        `}
      </style>
      {/* DESKTOP VIEW (md and above OR Print) */}
      <div className="d-none d-md-block d-print-block">
        <div className="d-flex justify-content-between align-items-center mb-3 no-print">
          <h3 className="m-0">Invoice {invoice.invoice_number}</h3>
          <div className="d-flex gap-3 gap-md-2 flex-wrap">
            <BackButton />
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

        <div className="card shadow-sm border-0">
          <div className="card-body invoice-print" style={{ color: '#000', fontSize: '13px', lineHeight: 1.4, padding: 0 }}>
            <div style={{ border: '1px solid #000', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '10px' }}>
                <div style={{ flex: '0 0 35%', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {company?.k2_recipient_code ? <>K-2 Recipient Code : {company.k2_recipient_code}<br /></> : null}
                  {company?.gstin ? <>GSTIN : {company.gstin}<br /></> : null}
                  {company?.pan ? <>Pan No : {company.pan}</> : null}
                </div>
                <div style={{ flex: '0 0 30%', textAlign: 'center' }}>
                  {/* <span style={{ fontSize: '14px', fontWeight: 'bold' }}>|| Shri ||</span><br /> */}
                  <div style={{ border: '1px solid #000', display: 'inline-block', padding: '2px 10px', marginTop: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                    CASH / CREDIT BILL
                  </div>
                </div>
                <div style={{ flex: '0 0 35%', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                  {company?.phone && <span>Phone : {company.phone}<br /></span>}
                  {company?.whatsapp_no && <span> {company.whatsapp_no}<br /></span>}
                  {company?.email}
                </div>
              </div>

              <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                  {company?.logo_url && <img src={company.logo_url} alt="Logo" style={{ maxHeight: '60px', maxWidth: '150px' }} />}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1.1 }}>{company?.company_name || 'Your Company'}</div>
                    {company?.address && <div style={{ fontSize: '13px', marginTop: '2px' }}>{company.address}</div>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' }}>
                <div>No: <span style={{ color: '#d00' }}>{invoice.invoice_number}</span></div>
                <div>Date: {invoice.invoice_date}</div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>
                Month: {getMonthYear(invoice.invoice_date)}
              </div>

              <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '8px' }}>To,</span>
                  <span style={{ flex: 1, fontSize: '16px', fontWeight: 'bold', borderBottom: '1px dotted #000', paddingBottom: '2px' }}>
                    {invoice.customer?.name || ''}
                  </span>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                <thead>
                  <tr>
                    <th className="print-col-sl" style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderTop: '2px solid #000', borderBottom: '2px solid #000', width: '60px' }}>Sl.No.</th>
                    <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>Particulars</th>
                    <th className="print-col-qty" style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderTop: '2px solid #000', borderBottom: '2px solid #000', width: '100px' }}>Quantity</th>
                    <th className="print-col-rate" style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderTop: '2px solid #000', borderBottom: '2px solid #000', width: '120px' }}>Rate</th>
                    <th className="print-col-amount" style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', borderTop: '2px solid #000', borderBottom: '2px solid #000', width: '140px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, idx) => {
                    const isAbsoluteLast = idx === invoice.items.length - 1 && (5 - invoice.items.length) <= 0;
                    return (
                      <tr key={it.id || idx}>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'center', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}>{String(idx + 1).padStart(2, '0')}.</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'left', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}>{it.item_name}</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'center', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}>{it.quantity}</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'center', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}>{Math.round(it.price)}/-</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'right', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}>{Number(it.line_total).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {/* Empty rows filling */}
                  {Array.from({ length: Math.max(5 - invoice.items.length, 0) }).map((_, i) => {
                    const isAbsoluteLast = i === Math.max(5 - invoice.items.length, 0) - 1;
                    return (
                      <tr key={`empty-${i}`}>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}><br /><br /></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '60px' : '4px' }}></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 0 }}>
                <table style={{ borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none' }}>
                  <tbody>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none' }}>Total</th>
                      <td style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'right', fontWeight: 'bold', width: '140px' }}>{Number(invoice.subtotal).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none' }}>CGST ({Number(invoice.cgst_percent || 0).toFixed(1)}%)</th>
                      <td style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'right', fontWeight: 'bold' }}>{Number(invoice.cgst_amount).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none' }}>SGST ({Number(invoice.sgst_percent || 0).toFixed(1)}%)</th>
                      <td style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'right', fontWeight: 'bold' }}>{Number(invoice.sgst_amount).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none', borderBottom: 'none' }}>Grand Total</th>
                      <td style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '14px', textAlign: 'right', fontWeight: 'bold', borderBottom: 'none' }}>{Number(invoice.grand_total).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', marginBottom: '10px' }}>
                <div style={{ flex: '0 0 60%', fontSize: '14px', lineHeight: 1.6, alignSelf: 'flex-end' }}>
                  Rupees in words:<br />
                  <span style={{ fontSize: '16px', borderBottom: '1px dotted #000', paddingBottom: '2px', fontWeight: 'bold' }}>
                    {numberToWords(invoice.grand_total)}
                  </span>
                </div>
                <div style={{ flex: '0 0 40%', textAlign: 'right', fontSize: '13px', alignSelf: 'flex-end' }}>
                  {company?.signature_url ? (
                    <div style={{ marginBottom: '4px' }}>
                      <img
                        src={company.signature_url}
                        alt='Authorised Signatory'
                        style={{ maxHeight: '70px', maxWidth: '180px' }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: '60px' }} />
                  )}
                  <div style={{ borderTop: '1px solid #000', display: 'inline-block', paddingTop: '5px' }}>
                    <div style={{ fontWeight: 'bold' }}>Authorized Signatory</div>
                    <div style={{ fontSize: '11px' }}>{company?.company_name}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (Below md - Hidden on Print) */}
      <div className="d-md-none p-3 space-y-4 bg-light d-print-none">
        {/* ACTION BUTTONS (Top Static - 1 Row) */}
        <div className="bg-white p-3 d-flex gap-3 gap-md-2 rounded-xl shadow-sm border no-print">
          <BackButton />
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
