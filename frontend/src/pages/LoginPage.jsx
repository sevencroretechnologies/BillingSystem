import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { login } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Swal from 'sweetalert2';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { loginUser, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // If already logged in, redirect to home
    if (token) {
        return <Navigate to="/" replace />;
    }

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login({ email, password });
            if (res.data.status) {
                Swal.fire({
                    title: 'Welcome Back!',
                    text: 'Login successful.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    loginUser(res.data.data.user, res.data.data.token);
                    navigate('/', { replace: true });
                });
            } else {
                const msg = res.data.message || 'Login failed';
                setError(msg);
                Swal.fire({
                    title: 'Login Failed',
                    text: msg,
                    icon: 'error',
                    confirmButtonColor: '#0d6efd'
                });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid credentials or server error.';
            setError(msg);
            Swal.fire({
                title: 'Error',
                text: msg,
                icon: 'error',
                confirmButtonColor: '#0d6efd'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper d-flex justify-content-center align-items-center" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px'
        }}>
            <div className="card login-card border-0 shadow-lg" style={{
                maxWidth: '380px',
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                <div className="card-body p-4 bg-white">
                    <div className="text-center mb-4">
                        <div className="login-icon-box shadow-sm mb-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <h2 className="fw-extra-bold h4 text-dark mb-1">Welcome Back</h2>
                        <p className="text-muted small">Sign in to manage your system</p>
                    </div>

                    <Alert message={error} onClose={() => setError('')} />

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-1" style={{ fontSize: '0.7rem' }}>Email Address</label>
                            <input
                                type="email"
                                className="form-control bg-light border-0 px-3 py-2"
                                style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                placeholder="admin@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-1" style={{ fontSize: '0.7rem' }}>Password</label>
                            <div className="position-relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control bg-light border-0 px-3 py-2"
                                    style={{ borderRadius: '10px', fontSize: '0.9rem', paddingRight: '2.5rem' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ zIndex: 10, padding: '0.375rem 0.75rem' }}
                                >
                                    {showPassword ?
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> :
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    }
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 fw-bold border-0 py-2 shadow-sm login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* <div className="text-center mt-4 pt-3 border-top">
                        <div className="p-2 rounded-3 bg-light">
                            <span className="d-block text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                                Master Admin Access
                            </span>
                            <code className="text-primary fw-medium" style={{ fontSize: '0.8rem' }}>
                                admin@gmail.com / Admin@123
                            </code>
                        </div>
                    </div> */}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .login-icon-box {
                    width: 52px;
                    height: 52px;
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                    border-radius: 12px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                }
                .fw-extra-bold { font-weight: 800; }
                .login-btn {
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                    border-radius: 10px;
                    transition: transform 0.2s ease;
                }
                .login-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
                }
                .login-card {
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
