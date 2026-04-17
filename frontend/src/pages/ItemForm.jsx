import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createItem, getItem, updateItem } from '../api/endpoints';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import Loading from '../components/Loading';

// Form for creating/editing an item/product.
export default function ItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    tax_percent: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getItem(id)
      .then((res) => setForm(res.data.data))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load item.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        tax_percent: Number(form.tax_percent || 0),
      };
      if (isEdit) {
        await updateItem(id, payload);
      } else {
        await createItem(payload);
      }
      navigate('/items');
    } catch (err) {
      if (err?.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        const flat = {};
        Object.keys(backendErrors).forEach((k) => {
          flat[k] = backendErrors[k][0];
        });
        setErrors(flat);
      } else {
        setError(err?.response?.data?.message || 'Failed to save item.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading item..." />;

  return (
    <div>
      <h3 className="mb-3">{isEdit ? 'Edit Item' : 'Add Item'}</h3>
      <Alert message={error} onClose={() => setError('')} />
      <form onSubmit={handleSubmit} className="card card-body shadow-sm">
        <FormField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          error={errors.name}
        />
        <div className="row">
          <div className="col-md-6">
            <FormField
              label="Price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              error={errors.price}
            />
          </div>
          <div className="col-md-6">
            <FormField
              label="Tax %"
              name="tax_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.tax_percent}
              onChange={handleChange}
              error={errors.tax_percent}
            />
          </div>
        </div>
        <FormField
          label="Description"
          name="description"
          as="textarea"
          rows={3}
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/items')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
