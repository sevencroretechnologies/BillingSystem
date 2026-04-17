import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createItem, getItem, updateItem } from '../api/endpoints';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import Loading from '../components/Loading';

// Form for creating/editing an item/product. Price is no longer stored
// on the item — it is entered per line when creating an invoice.
export default function ItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
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
      .then((res) =>
        setForm({
          name: res.data.data.name ?? '',
          description: res.data.data.description ?? '',
        })
      )
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
      if (isEdit) {
        await updateItem(id, form);
      } else {
        await createItem(form);
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
        <FormField
          label="Description"
          name="description"
          as="textarea"
          rows={3}
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />
        <p className="text-muted small mb-3">
          Price is entered per line while creating an invoice so different
          customers can be billed at different rates.
        </p>
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
