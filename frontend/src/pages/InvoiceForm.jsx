import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice, listCustomers, listItems } from '../api/endpoints';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

// Page to create a new invoice. Loads customers and items, lets the user
// add multiple rows and auto-fills price/tax from the selected item.
export default function InvoiceForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [rows, setRows] = useState([blankRow()]);

  function blankRow() {
    return {
      item_id: '',
      item_name: '',
      quantity: 1,
      price: 0,
      tax_percent: 0,
    };
  }

  useEffect(() => {
    (async () => {
      try {
        const [c, i] = await Promise.all([
          listCustomers({ per_page: 100 }),
          listItems({ per_page: 100 }),
        ]);
        setCustomers(c.data.data);
        setItems(i.data.data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load form data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRowChange = (idx, field, value) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [field]: value };

    // Auto-fill price / tax / name when the user picks an existing item.
    if (field === 'item_id') {
      const item = items.find((it) => String(it.id) === String(value));
      if (item) {
        next[idx].item_name = item.name;
        next[idx].price = Number(item.price);
        next[idx].tax_percent = Number(item.tax_percent);
      }
    }
    setRows(next);
  };

  const addRow = () => setRows([...rows, blankRow()]);
  const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    rows.forEach((r) => {
      const qty = Number(r.quantity) || 0;
      const price = Number(r.price) || 0;
      const taxPct = Number(r.tax_percent) || 0;
      const lineSub = qty * price;
      subtotal += lineSub;
      tax += lineSub * (taxPct / 100);
    });
    return {
      subtotal: round(subtotal),
      tax: round(tax),
      total: round(subtotal + tax),
    };
  }, [rows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        customer_id: Number(form.customer_id),
        invoice_date: form.invoice_date,
        notes: form.notes,
        items: rows.map((r) => ({
          item_id: r.item_id ? Number(r.item_id) : null,
          item_name: r.item_name,
          quantity: Number(r.quantity),
          price: Number(r.price),
          tax_percent: Number(r.tax_percent || 0),
        })),
      };
      const res = await createInvoice(payload);
      navigate(`/invoices/${res.data.data.id}`);
    } catch (err) {
      if (err?.response?.status === 422) {
        const errs = err.response.data.errors || {};
        const first = Object.values(errs)[0]?.[0];
        setError(first || 'Please check the form values.');
      } else {
        setError(err?.response?.data?.message || 'Failed to create invoice.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading form..." />;

  return (
    <div>
      <h3 className="mb-3">New Invoice</h3>
      <Alert message={error} onClose={() => setError('')} />
      <form onSubmit={handleSubmit} className="card card-body shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              Customer <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Invoice Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={form.invoice_date}
              onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
              required
            />
          </div>
        </div>

        <hr className="my-4" />
        <h5>Items</h5>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Item</th>
                <th>Name</th>
                <th style={{ width: 80 }}>Qty</th>
                <th style={{ width: 110 }}>Price</th>
                <th style={{ width: 90 }}>Tax %</th>
                <th style={{ width: 120 }} className="text-end">
                  Total
                </th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const qty = Number(row.quantity) || 0;
                const price = Number(row.price) || 0;
                const taxPct = Number(row.tax_percent) || 0;
                const lineTotal = round(qty * price * (1 + taxPct / 100));
                return (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={row.item_id}
                        onChange={(e) => handleRowChange(idx, 'item_id', e.target.value)}
                      >
                        <option value="">Custom...</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.item_name}
                        onChange={(e) => handleRowChange(idx, 'item_name', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm"
                        value={row.price}
                        onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="form-control form-control-sm"
                        value={row.tax_percent}
                        onChange={(e) => handleRowChange(idx, 'tax_percent', e.target.value)}
                      />
                    </td>
                    <td className="text-end align-middle">{lineTotal.toFixed(2)}</td>
                    <td className="align-middle">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeRow(idx)}
                          aria-label="Remove row"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addRow}>
            + Add Row
          </button>
        </div>

        <div className="row mt-4">
          <div className="col-md-7">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="col-md-5">
            <table className="table table-sm">
              <tbody>
                <tr>
                  <th>Subtotal</th>
                  <td className="text-end">{totals.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Tax</th>
                  <td className="text-end">{totals.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <th className="fs-5">Grand Total</th>
                  <td className="text-end fs-5 fw-bold">{totals.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function round(n) {
  return Math.round(n * 100) / 100;
}
