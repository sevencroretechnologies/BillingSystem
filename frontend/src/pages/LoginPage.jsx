import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login({ email, password });
            if (res.data.status) {
                loginUser(res.data.data.user, res.data.data.token);
                navigate(from, { replace: true });
            } else {
                setError(res.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials or server error.');
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
                            <input
                                type="password"
                                className="form-control bg-light border-0 px-3 py-2"
                                style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
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
