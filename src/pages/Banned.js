import { useAuth } from '../contexts/AuthContext';
import '../styles/main.css';

export default function BannedPage() {
    const { logout } = useAuth();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '20px',
        }}>
            <div style={{
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center',
                padding: '40px',
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                </div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                }}>
                    Access Denied
                </h1>
                <p style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '32px',
                }}>
                    Your account has been banned. You no longer have access to the platform.
                    If you believe this is a mistake, please contact support.
                </p>
                <button
                    onClick={logout}
                    style={{
                        padding: '12px 24px',
                        background: 'var(--accent-gradient)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
