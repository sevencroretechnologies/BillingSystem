import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createInvoice,
  createItem,
  getInvoice,
  getTax,
  listCustomers,
  listItems,
  updateInvoice,
} from '../api/endpoints';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

// Page to create or edit an invoice. Loads customers, items and the current
// SGST/CGST configuration, lets the user enter a custom price per line,
// and live-calculates the subtotal, tax breakdown and grand total.
export default function InvoiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [tax, setTax] = useState({ sgst: 0, cgst: 0 });
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
      price: '',
    };
  }

  useEffect(() => {
    (async () => {
      try {
        // Load customers, items and current tax rates in parallel.
        const promises = [
          listCustomers({ per_page: 100 }),
          listItems({ per_page: 100 }),
          getTax(),
        ];
        if (isEdit) {
          promises.push(getInvoice(id));
        }
        const results = await Promise.all(promises);
        const [c, i, t] = results;
        setCustomers(c.data.data);
        setItems(i.data.data);
        setTax({
          sgst: Number(t.data.data.sgst) || 0,
          cgst: Number(t.data.data.cgst) || 0,
        });

        if (isEdit && results[3]) {
          const inv = results[3].data.data;
          setForm({
            customer_id: String(inv.customer_id || ''),
            invoice_date: inv.invoice_date || '',
            notes: inv.notes || '',
          });
          if (inv.items && inv.items.length > 0) {
            setRows(
              inv.items.map((it) => ({
                item_id: it.item_id ? String(it.item_id) : '',
                item_name: it.item_name || '',
                quantity: it.quantity || 1,
                price: it.price || '',
              }))
            );
          }
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load form data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleRowChange = (idx, field, value) => {
    const next = [...rows];

    if (field === 'item_id') {
      const item = items.find((it) => String(it.id) === String(value));
      next[idx] = {
        ...next[idx],
        item_id: value,
        item_name: item ? item.name : value, // Fallback to value if it's a new item name
      };
    } else {
      next[idx] = { ...next[idx], [field]: value };
    }

    setRows(next);
  };

  // Convert items to react-select options
  const productOptions = useMemo(() => {
    return items.map((it) => ({
      value: String(it.id),
      label: `${it.name}`,
    }));
  }, [items]);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '38px',
      borderRadius: '0.375rem',
      borderColor: '#dee2e6',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#86b7fe',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 12px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#f8f9fa' : 'white',
      color: state.isSelected ? 'white' : 'black',
      fontSize: '0.875rem',
    }),
  };

  const addRow = () => setRows([...rows, blankRow()]);
  const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

  // Live totals. Tax is calculated once on the full subtotal using the
  // SGST + CGST rates fetched from the backend — matching server-side
  // logic so the displayed grand total is what gets saved.
  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, r) => {
      const qty = Number(r.quantity) || 0;
      const price = Number(r.price) || 0;
      return sum + qty * price;
    }, 0);
    const sgstAmount = subtotal * (tax.sgst / 100);
    const cgstAmount = subtotal * (tax.cgst / 100);
    const taxTotal = sgstAmount + cgstAmount;
    return {
      subtotal: round(subtotal),
      sgstAmount: round(sgstAmount),
      cgstAmount: round(cgstAmount),
      taxTotal: round(taxTotal),
      total: round(subtotal + taxTotal),
    };
  }, [rows, tax]);

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
        })),
      };
      if (isEdit) {
        await updateInvoice(id, payload);
        navigate(`/invoices/${id}`);
      } else {
        const res = await createInvoice(payload);
        navigate(`/invoices/${res.data.data.id}`);
      }
    } catch (err) {
      if (err?.response?.status === 422) {
        const errs = err.response.data.errors || {};
        const first = Object.values(errs)[0]?.[0];
        setError(first || 'Please check the form values.');
      } else {
        setError(err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} invoice.`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading form..." />;

  return (
    <div>
      <h3 className="mb-3">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h3>
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
          <div className="col-md-3">
            <label className="form-label">Tax Rates</label>
            <div className="form-control-plaintext small">
              SGST {Number(tax.sgst).toFixed(2)}% + CGST {Number(tax.cgst).toFixed(2)}%
              <div className="text-muted">
                Manage in <a href="/settings/tax">Settings &rarr; Tax</a>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4" />
        {/* DESKTOP TABLE (Hidden on mobile) */}
        <div className="d-none d-md-block">
          <h5>Items</h5>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Item</th>
                <th style={{ width: 80 }}>Qty</th>
                <th style={{ width: 120 }}>Price</th>
                <th style={{ width: 120 }} className="text-end">
                  Line Total
                </th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const qty = Number(row.quantity) || 0;
                const price = Number(row.price) || 0;
                const lineTotal = round(qty * price);
                return (
                  <tr key={idx}>
                    <td>
                      <CreatableSelect
                        options={productOptions}
                        styles={customSelectStyles}
                        value={
                          productOptions.find((opt) => opt.value === String(row.item_id)) ||
                          (row.item_name ? { value: String(row.item_id), label: row.item_name } : null)
                        }
                        onChange={(opt) => handleRowChange(idx, 'item_id', opt ? opt.value : '')}
                        onCreateOption={(val) => handleRowChange(idx, 'item_id', val)}
                        placeholder="Search or type item..."
                        isSearchable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
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
                          placeholder="0.00"
                          required
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
                            &times;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className="mt-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addRow}>
              + Add Row
            </button>
          </div>
        </div>

        {/* MOBILE COMPACT ROWS (Only visible on mobile) */}
        <div className="d-md-none space-y-3">
          <p className="text-sm font-semibold text-gray-700">Items</p>
          {rows.map((item, index) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const lineTotal = round(qty * price);
            return (
              <div key={index} className="bg-white border rounded-lg p-3 shadow-sm">
                {/* Row 1: Product Select */}
                <div className="mb-2">
                  <CreatableSelect
                    options={productOptions}
                    styles={customSelectStyles}
                    value={
                      productOptions.find((opt) => opt.value === String(item.item_id)) ||
                      (item.item_name ? { value: String(item.item_id), label: item.item_name } : null)
                    }
                    onChange={(opt) => handleRowChange(index, 'item_id', opt ? opt.value : '')}
                    onCreateOption={(val) => handleRowChange(index, 'item_id', val)}
                    placeholder="Search or type item..."
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                {/* Row 2: Qty + Price */}
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <p className="mb-1 text-secondary" style={{ fontSize: '10px' }}>
                      Qty
                    </p>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                      className="form-control text-sm p-2"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <p className="mb-1 text-secondary" style={{ fontSize: '10px' }}>
                      Price
                    </p>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                      className="form-control text-sm p-2"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Total + Remove */}
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-sm font-medium">₹{lineTotal.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="btn btn-link text-danger p-0 text-decoration-none text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Row Button */}
          <button
            type="button"
            onClick={addRow}
            className="w-full border border-dashed p-2 rounded text-sm text-primary bg-light mt-2"
          >
            + Add Item
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
                  <th>SGST ({Number(tax.sgst).toFixed(2)}%)</th>
                  <td className="text-end">{totals.sgstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>CGST ({Number(tax.cgst).toFixed(2)}%)</th>
                  <td className="text-end">{totals.cgstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Total Tax</th>
                  <td className="text-end">{totals.taxTotal.toFixed(2)}</td>
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
            {saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Save Invoice'}
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
