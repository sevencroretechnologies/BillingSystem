import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createCustomer,
  getCustomer,
  updateCustomer,
} from '../api/endpoints';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import Loading from '../components/Loading';
import BackButton from '../components/BackButton';

// Form for creating/editing a customer.
export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getCustomer(id)
      .then((res) => setForm(res.data.data))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load customer.'))
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
        await updateCustomer(id, form);
      } else {
        await createCustomer(form);
      }
      navigate('/customers');
    } catch (err) {
      if (err?.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        const flat = {};
        Object.keys(backendErrors).forEach((k) => {
          flat[k] = backendErrors[k][0];
        });
        setErrors(flat);
      } else {
        setError(err?.response?.data?.message || 'Failed to save customer.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading customer..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">{isEdit ? 'Edit Customer' : 'Add Customer'}</h3>
        <BackButton />
      </div>
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
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Address"
          name="address"
          as="textarea"
          rows={3}
          value={form.address}
          onChange={handleChange}
          error={errors.address}
        />
        <div className="d-flex gap-3 gap-md-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/customers')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
