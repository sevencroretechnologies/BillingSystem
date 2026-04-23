import { useState } from 'react';
import { changePassword } from '../api/endpoints';
import Alert from '../components/Alert';
import BackButton from '../components/BackButton';

export default function ChangePassword() {
    const [form, setForm] = useState({
        old_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await changePassword(form);
            if (res.data.status) {
                setSuccess('Password changed successfully.');
                setForm({
                    old_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                });
            } else {
                setError(res.data.message || 'Failed to change password.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating password. Check your old password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">Change Password</h3>
                <BackButton />
            </div>

            <Alert message={error} onClose={() => setError('')} />
            {success && (
                <div className="alert alert-success" role="alert">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card card-body shadow-sm" style={{ maxWidth: '500px' }}>
                <div className="mb-3">
                    <label className="form-label">Old Password</label>
                    <input
                        type="password"
                        name="old_password"
                        className="form-control"
                        value={form.old_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        name="new_password"
                        className="form-control"
                        value={form.new_password}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                        type="password"
                        name="new_password_confirmation"
                        className="form-control"
                        value={form.new_password_confirmation}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
