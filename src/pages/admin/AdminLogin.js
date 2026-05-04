import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import '../../styles/admin.css';

export default function AdminLogin() {
    const { loginWithGoogle, loginWithEmail, isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authMode, setAuthMode] = useState('email');
    const [error, setError] = useState('');
    const [signingIn, setSigningIn] = useState(false);
    const [redirectReady, setRedirectReady] = useState(false);

    useEffect(() => {
        if (!loading && isAdmin) {
            setRedirectReady(true);
        }
    }, [loading, isAdmin]);

    useEffect(() => {
        if (redirectReady) {
            navigate('/a/ctrl/dashboard', { replace: true });
        }
    }, [redirectReady, navigate]);

    const handleGoogleSignIn = async () => {
        setError('');
        setSigningIn(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Sign-in was cancelled');
            } else {
                setError(error.message || 'Failed to sign in with Google');
            }
        } finally {
            setSigningIn(false);
        }
    };

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password.trim()) {
            setError('Email and password are required');
            return;
        }
        setSigningIn(true);
        try {
            await loginWithEmail(email.trim(), password);
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many attempts. Try again later');
            } else {
                setError(error.message || 'Failed to sign in');
            }
        } finally {
            setSigningIn(false);
        }
    };

    if (redirectReady) {
        return null;
    }

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

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <button
                            onClick={() => { setAuthMode('email'); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: authMode === 'email' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                                border: 'none',
                                borderRadius: '8px',
                                color: authMode === 'email' ? '#fff' : 'var(--text-secondary)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            Email
                        </button>
                        <button
                            onClick={() => { setAuthMode('google'); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: authMode === 'google' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                                border: 'none',
                                borderRadius: '8px',
                                color: authMode === 'google' ? '#fff' : 'var(--text-secondary)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            Google
                        </button>
                    </div>

                    {authMode === 'email' ? (
                        <form className="admin-login-form" onSubmit={handleEmailSignIn}>
                            <div className="admin-input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <div className="admin-input-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="admin-login-btn"
                                disabled={signingIn}
                            >
                                {signingIn ? (
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
                    ) : (
                        <div className="admin-login-form">
                            <button
                                className="admin-login-btn"
                                onClick={handleGoogleSignIn}
                                disabled={signingIn || loading}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                            >
                                {signingIn ? (
                                    <div className="admin-spinner"></div>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Sign in with Google
                                    </>
                                )}
                            </button>
                        </div>
                    )}

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
