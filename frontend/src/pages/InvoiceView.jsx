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
  const baseURL = process.env.REACT_APP_API_URL;
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
            body { margin: 0.5cm; }
            .bottom-nav, .navbar, .fab-container, .no-print { display: none !important; }
            .invoice-footer-block { break-inside: avoid; page-break-inside: avoid; }
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
              onClick={() => navigate(`/invoices`)}
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
            <div style={{ border: '1px solid #000', padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '10px' }}>
                <div style={{ flex: '0 0 35%', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {company?.k2_recipient_code ? <>K-2 Recipient Code : {company.k2_recipient_code}<br /></> : null}
                  {company?.gstin ? <>GSTIN : {company.gstin}<br /></> : null}
                  {company?.pan ? <>Pan No : {company.pan}</> : null}
                </div>
                <div style={{ flex: '0 0 30%', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>|| Shri Banashankari Devi Prasanna ||</span><br />
                  <div style={{ border: '1px solid #000', display: 'inline-block', padding: '2px 10px', marginTop: '5px', fontWeight: 'bold', fontSize: '10px' }}>
                    CASH / CREDIT BILL
                  </div>
                </div>
                <div style={{ flex: '0 0 35%', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                  {company?.phone && <span>Phone : {company.phone}<br /></span>}
                  {company?.whatsapp_no && <span> {company.whatsapp_no}<br /></span>}
                  {company?.email}
                </div>
              </div>

              <div style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                  {company?.logo && <img src={`${baseURL}/storage/${company.logo}`} alt="Logo" style={{ maxHeight: '60px', maxWidth: '150px' }} />}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1.1 }}>{company?.company_name || 'Your Company'}</div>
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
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'center', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}>{String(idx + 1).padStart(2, '0')}.</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'left', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}>{it.item_name}</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'center', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}>{it.quantity}</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'center', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}>{Math.round(it.price)}/-</td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', textAlign: 'right', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}>{Number(it.line_total).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {/* Empty rows filling */}
                  {Array.from({ length: Math.max(5 - invoice.items.length, 0) }).map((_, i) => {
                    const isAbsoluteLast = i === Math.max(5 - invoice.items.length, 0) - 1;
                    return (
                      <tr key={`empty-${i}`}>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}><br /><br /></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}></td>
                        <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 8px', borderBottom: 'none', paddingBottom: isAbsoluteLast ? '10px' : '4px' }}></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="invoice-footer-block" style={{ marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <table style={{ borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none' }}>
                    <tbody>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none' }}>Total</th>
                        <td style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold', width: '140px' }}>{Number(invoice.subtotal).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none' }}>CGST ({Number(invoice.cgst_percent || 0).toFixed(1)}%)</th>
                        <td style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>{Number(invoice.cgst_amount).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none' }}>SGST ({Number(invoice.sgst_percent || 0).toFixed(1)}%)</th>
                        <td style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>{Number(invoice.sgst_amount).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'left', fontWeight: 'bold', borderLeft: 'none', borderBottom: 'none' }}>Grand Total</th>
                        <td style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold', borderBottom: 'none' }}>{Number(invoice.grand_total).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: 1.2 }}>
                  Rupees in words:<br />
                  <span style={{ fontSize: '14px', borderBottom: '1px dotted #000', paddingBottom: '2px', fontWeight: 'bold' }}>
                    {numberToWords(invoice.grand_total)}
                  </span>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '12px' }}>
                  {company?.signature ? (
                    <div style={{ marginBottom: '4px' }}>
                      <img src={`${baseURL}/storage/${company.signature}`}
                        alt='Authorised Signatory'
                        style={{ maxHeight: '60px', maxWidth: '180px' }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: '40px' }} />
                  )}
                  <div style={{ borderTop: '1px solid #000', display: 'inline-block', paddingTop: '5px' }}>
                    <div style={{ fontWeight: 'bold' }}>Authorized Signatory</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (Below md - Hidden on Print) */}
      <div className="d-md-none d-print-none" style={{ minHeight: '100vh', paddingBottom: '120px', backgroundColor: '#f4f7fa' }}>
        {/* TOP ACTION BAR - STICKY */}
        <div className="sticky-top bg-white border-bottom p-3 shadow-sm" style={{ zIndex: 1000 }}>
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-light py-2 rounded-lg fw-bold d-flex align-items-center justify-content-center text-xs border"
              style={{ flex: '0 0 70px', height: '40px' }}
              onClick={() => navigate('/invoices')}
            >
              Back
            </button>
            <div className="flex-fill d-flex gap-2">
              <button
                className="btn btn-outline-primary py-2 rounded-lg fw-bold d-flex align-items-center justify-content-center text-xs flex-fill"
                style={{ height: '40px' }}
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              >
                Edit
              </button>
              <a
                className="btn btn-outline-success py-2 rounded-lg fw-bold d-flex align-items-center justify-content-center text-xs flex-fill"
                style={{ height: '40px' }}
                href={invoicePdfUrl(invoice.id, true)}
                target="_blank"
                rel="noreferrer"
              >
                PDF
              </a>
              <button
                className="btn btn-primary py-2 rounded-lg fw-bold shadow-sm text-xs flex-fill"
                style={{ height: '40px' }}
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>
          </div>
        </div>

        <div className="p-3">
          {/* COMPANY DETAILS CARD */}
          <div className="bg-white rounded-3 shadow-sm border mb-3 overflow-hidden">
            <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>|| Shri Banashankari Devi Prasanna ||</span>
              <span className="badge bg-dark text-uppercase" style={{ fontSize: '9px' }}>Cash / Credit Bill</span>
            </div>
            <div className="p-3">
              <div className="d-flex align-items-center gap-3 mb-3">
                {company?.logo && (
                  <div className="border rounded p-1">
                    <img src={`${baseURL}/storage/${company.logo}`} alt="Logo" style={{ maxHeight: '50px', maxWidth: '80px', objectFit: 'contain' }} />
                  </div>
                )}
                <div>
                  <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14px', lineHeight: 1.2 }}>{company?.company_name}</h6>
                  <p className="text-secondary mb-0" style={{ fontSize: '11px' }}>{company?.address}</p>
                </div>
              </div>

              <div className="row g-3 pt-2 border-top">
                <div className="col-6">
                  <p className="text-uppercase text-secondary fw-bold mb-1" style={{ fontSize: '9px' }}>Registration</p>
                  <div className="small" style={{ fontSize: '11px', lineHeight: 1.4 }}>
                    {company?.gstin && <div><span className="text-muted">GST:</span> {company.gstin}</div>}
                    {company?.pan && <div><span className="text-muted">PAN:</span> {company.pan}</div>}
                    {company?.k2_recipient_code && <div><span className="text-muted">K-2:</span> {company.k2_recipient_code}</div>}
                  </div>
                </div>
                <div className="col-6">
                  <p className="text-uppercase text-secondary fw-bold mb-1" style={{ fontSize: '9px' }}>Contact</p>
                  <div className="small" style={{ fontSize: '11px', lineHeight: 1.4 }}>
                    {company?.phone && <div>{company.phone}</div>}
                    {company?.whatsapp_no && <div>{company.whatsapp_no}</div>}
                    <div className="text-truncate" style={{ maxWidth: '100%' }}>{company?.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HEADER SECTION (Invoice # and Date) */}
          <div className="bg-white rounded-3 shadow-sm border mb-3 overflow-hidden">
            <div className="bg-primary p-1"></div>
            <div className="p-3">
              <div className="row g-0">
                <div className="col-6 border-end pe-3">
                  <p className="text-uppercase text-secondary fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Invoice Number</p>
                  <p className="fw-bold text-dark mb-0 fs-5">{invoice.invoice_number}</p>
                </div>
                <div className="col-6 ps-3">
                  <p className="text-uppercase text-secondary fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Invoice Date</p>
                  <p className="fw-bold text-dark mb-0 fs-6">{invoice.invoice_date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER SECTION */}
          <div className="bg-white rounded-3 shadow-sm border mb-4 p-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-primary bi bi-person-fill" viewBox="0 0 16 16">
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  </svg>
                </div>
                <p className="text-uppercase text-secondary fw-bold mb-0" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Billing To</p>
              </div>
              <p className="fw-bold text-primary fs-5 mb-0 text-end">{invoice.customer?.name}</p>
            </div>

            {invoice.customer?.email && (
              <div className="d-flex justify-content-between align-items-center mb-2">
                <p className="text-secondary small mb-0 fw-bold text-uppercase opacity-75" style={{ fontSize: '10px' }}>Email</p>
                <p className="text-dark small mb-0 fw-semibold text-end">{invoice.customer.email}</p>
              </div>
            )}

            {invoice.customer?.address && (
              <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-start">
                <p className="text-secondary small mb-0 fw-bold text-uppercase opacity-75" style={{ fontSize: '10px' }}>Address</p>
                <p className="text-secondary mb-0 small opacity-75 text-end" style={{ maxWidth: '70%' }}>{invoice.customer.address}</p>
              </div>
            )}
          </div>

          {/* ITEMS SECTION */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
              <p className="text-uppercase text-secondary fw-bold mb-0" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Items ({invoice.items.length})</p>
            </div>
            <div className="d-flex flex-column gap-3">
              {invoice.items.map((it, idx) => (
                <div key={idx} className="bg-white rounded-3 shadow-sm border overflow-hidden">
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <p className="fw-bold text-dark fs-6 mb-0" style={{ lineHeight: 1.3 }}>{it.item_name}</p>
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                        {money(it.line_total)}
                      </span>
                    </div>
                    <div className="row g-2 text-center bg-light rounded-2 p-2">
                      <div className="col-4">
                        <p className="text-secondary mb-0 fw-bold" style={{ fontSize: '9px' }}>QTY</p>
                        <p className="fw-bold text-dark mb-0 small">{it.quantity}</p>
                      </div>
                      <div className="col-4 border-start border-end">
                        <p className="text-secondary mb-0 fw-bold" style={{ fontSize: '9px' }}>RATE</p>
                        <p className="fw-bold text-dark mb-0 small">{money(it.price)}</p>
                      </div>
                      <div className="col-4">
                        <p className="text-secondary mb-0 fw-bold" style={{ fontSize: '9px' }}>TAX</p>
                        <p className="fw-bold text-dark mb-0 small">{combinedTax.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOTALS & WORDS SECTION */}
          <div className="bg-white rounded-4 shadow-lg border-0 mb-4 overflow-hidden">
            <div className="p-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Subtotal</span>
                <span className="fw-semibold">{money(invoice.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>SGST ({Number(invoice.sgst_percent || 0).toFixed(1)}%)</span>
                <span>{money(invoice.sgst_amount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small text-secondary">
                <span>CGST ({Number(invoice.cgst_percent || 0).toFixed(1)}%)</span>
                <span>{money(invoice.cgst_amount)}</span>
              </div>
              <div className="pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold text-dark fs-5">Grand Total</span>
                  <span className="fw-bold text-primary fs-3">{money(invoice.grand_total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-light p-4 border-top">
              <p className="text-uppercase text-secondary fw-bold mb-2" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Amount in Words</p>
              <p className="fw-bold text-dark mb-0 small" style={{ lineHeight: 1.5 }}>{numberToWords(invoice.grand_total)}</p>
            </div>
          </div>

          {/* SIGNATORY SECTION */}
          <div className="bg-white rounded-3 shadow-sm border p-4 mb-2 text-center">
            {company?.signature ? (
              <div className="mb-3">
                <img src={`${baseURL}/storage/${company.signature}`}
                  alt='Authorised Signatory'
                  style={{ maxHeight: '80px', maxWidth: '100%' }}
                />
              </div>
            ) : (
              <div style={{ height: '60px', border: '1px dashed #dee2e6', borderRadius: '8px', marginBottom: '15px' }} className="d-flex align-items-center justify-content-center text-secondary small opacity-50">Signature Placeholder</div>
            )}
            <div className="pt-2 border-top">
              <p className="fw-bold text-dark mb-0">Authorized Signatory</p>
              {/* <p className="text-secondary small mb-0">{company?.company_name}</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
