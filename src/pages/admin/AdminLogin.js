import { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import '../../styles/admin.css';

export default function AdminLogin() {
    const { adminAuth, login } = useAdmin();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (adminAuth.isAuthenticated) {
        navigate('/admin/dashboard');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        await new Promise(r => setTimeout(r, 600));

        const result = login(username, password);
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error || 'Access denied');
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-bg">
                <div className="admin-grid-pattern"></div>
                <div className="admin-glow admin-glow-1"></div>
                <div className="admin-glow admin-glow-2"></div>
            </div>

            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <div className="admin-login-logo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                <path d="M12 8v4"/>
                                <path d="M12 16h.01"/>
                            </svg>
                        </div>
                        <h1 className="admin-login-title">Admin Panel</h1>
                        <p className="admin-login-subtitle">Authorized access only</p>
                    </div>

                    {error && (
                        <div className="admin-login-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="admin-login-form" onSubmit={handleSubmit}>
                        <div className="admin-input-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                autoComplete="off"
                            />
                        </div>

                        <div className="admin-input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                autoComplete="off"
                            />
                        </div>

                        <button
                            type="submit"
                            className="admin-login-btn"
                            disabled={loading || !username || !password}
                        >
                            {loading ? (
                                <div className="admin-spinner"></div>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="admin-login-footer">
                        <span className="admin-login-badge">
                            <div className="admin-badge-dot"></div>
                            Secure Admin Portal
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
