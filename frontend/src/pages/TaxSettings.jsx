import { useEffect, useState } from 'react';
import { getTax, updateTax } from '../api/endpoints';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import Loading from '../components/Loading';
import BackButton from '../components/BackButton';

// Settings page for the single-row tax configuration used on every
// invoice. Stores SGST + CGST as separate percentages.
export default function TaxSettings() {
  const [form, setForm] = useState({ sgst: '', cgst: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getTax();
        setForm({
          sgst: String(res.data.data.sgst ?? ''),
          cgst: String(res.data.data.cgst ?? ''),
        });
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load tax settings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    // Prevent negative values for numeric inputs
    if (e.target.type === 'number' && Number(value) < 0) {
      value = '0';
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateTax({
        sgst: Number(form.sgst || 0),
        cgst: Number(form.cgst || 0),
      });
      setSuccess('Tax settings saved.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save tax settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading tax settings..." />;

  const combined = (Number(form.sgst) || 0) + (Number(form.cgst) || 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Tax Settings</h3>
        <BackButton />
      </div>
      <p className="text-muted">
        These rates are applied on every new invoice. Total tax = SGST + CGST,
        calculated on the invoice subtotal.
      </p>
      <Alert message={error} onClose={() => setError('')} />
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="card card-body shadow-sm" style={{ maxWidth: 520 }}>
        <div className="row">
          <div className="col-md-6">
            <FormField
              label="SGST %"
              name="sgst"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.sgst}
              onChange={handleChange}
              onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
              required
            />
          </div>
          <div className="col-md-6">
            <FormField
              label="CGST %"
              name="cgst"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.cgst}
              onChange={handleChange}
              onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <span className="badge text-bg-light border">
            Combined tax: {combined.toFixed(2)}%
          </span>
        </div>
        <div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
