import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/endpoints';
import BackButton from '../components/BackButton';
import Swal from 'sweetalert2';

export default function ChangePassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        old_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await changePassword(form);
            if (res.data.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Password changed successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate('/');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: res.data.message || 'Failed to change password.',
                    confirmButtonColor: '#0d6efd'
                });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error updating password. Check your old password.';
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: msg,
                confirmButtonColor: '#0d6efd'
            });
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

            <form onSubmit={handleSubmit} className="card card-body shadow-sm" style={{ maxWidth: '500px' }}>
                <div className="mb-3">
                    <label className="form-label">Old Password</label>
                    <div className="position-relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            name="old_password"
                            className="form-control"
                            value={form.old_password}
                            onChange={handleChange}
                            required
                        />
                        <button 
                            type="button" 
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            style={{ zIndex: 10, padding: '0.375rem 0.75rem' }}
                        >
                            {showOldPassword ? 
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : 
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            }
                        </button>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <div className="position-relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="new_password"
                            className="form-control"
                            value={form.new_password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                        <button 
                            type="button" 
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ zIndex: 10, padding: '0.375rem 0.75rem' }}
                        >
                            {showNewPassword ? 
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : 
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            }
                        </button>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <div className="position-relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="new_password_confirmation"
                            className="form-control"
                            value={form.new_password_confirmation}
                            onChange={handleChange}
                            required
                        />
                        <button 
                            type="button" 
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ zIndex: 10, padding: '0.375rem 0.75rem' }}
                        >
                            {showConfirmPassword ? 
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : 
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            }
                        </button>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
