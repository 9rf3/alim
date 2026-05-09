import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminSubjects from './AdminSubjects';
import AdminReviews from './AdminReviews';
import AdminConfig from './AdminConfig';
import AdminAnalytics from './AdminAnalytics';
import AdminLogs from './AdminLogs';
import AdminSubscriptions from './AdminSubscriptions';
import '../../styles/main.css';
import '../../styles/admin.css';

export default function AdminDashboard() {
    const { userProfile, logout, isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    useEffect(() => {
        if (!loading && !isAdmin) {
            navigate('/a/ctrl', { replace: true });
        }
    }, [loading, isAdmin, navigate, userProfile]);

    if (loading || !isAdmin) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const sections = [
        { id: 'overview', label: 'Overview', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
            </svg>
        )},
        { id: 'users', label: 'Users', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        )},
        { id: 'subjects', label: 'Subjects', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
        )},
        { id: 'reviews', label: 'Reviews', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        )},
        { id: 'analytics', label: 'Analytics', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                <path d="M22 12h-4l-3 9-6-18-3 9H2"/>
            </svg>
        )},
        { id: 'logs', label: 'Logs', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
        )},
        { id: 'subscriptions', label: 'Subscriptions', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
        )},
        { id: 'config', label: 'Settings', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
        )},
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'users':
                return <AdminUsers globalSearch={globalSearch} />;
            case 'subjects':
                return <AdminSubjects globalSearch={globalSearch} />;
            case 'reviews':
                return <AdminReviews />;
            case 'analytics':
                return <AdminAnalytics />;
            case 'logs':
                return <AdminLogs />;
            case 'subscriptions':
                return <AdminSubscriptions />;
            case 'config':
                return <AdminConfig />;
            default:
                return <AdminOverview onNavigate={setActiveSection} />;
        }
    };

    const pageTitle = sections.find(s => s.id === activeSection)?.label || 'Dashboard';

    return (
        <div className="admin-dashboard">
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                />
            )}

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div className="admin-sidebar-brand">
                        <span className="admin-sidebar-title">Alim-lab</span>
                        <span className="admin-sidebar-subtitle">Admin Panel</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    <div className="admin-nav-section">
                        <div className="admin-nav-section-title">Main</div>
                        {sections.slice(0, 1).map(section => (
                            <button
                                key={section.id}
                                className={`admin-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </div>

                    <div className="admin-nav-section">
                        <div className="admin-nav-section-title">Management</div>
                        {sections.slice(1, 4).map(section => (
                            <button
                                key={section.id}
                                className={`admin-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </div>

                    <div className="admin-nav-section">
                        <div className="admin-nav-section-title">Monitoring</div>
                        {sections.slice(4, 7).map(section => (
                            <button
                                key={section.id}
                                className={`admin-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </div>

                    <div className="admin-nav-section">
                        <div className="admin-nav-section-title">System</div>
                        {sections.slice(7).map(section => (
                            <button
                                key={section.id}
                                className={`admin-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">
                            {userProfile?.photoURL ? (
                                <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            ) : (
                                (userProfile?.fullName?.[0] || userProfile?.email?.[0] || 'A').toUpperCase()
                            )}
                        </div>
                        <div className="admin-user-details">
                            <div className="admin-user-name">{userProfile?.fullName || 'Admin'}</div>
                            <div className="admin-user-role">Administrator</div>
                        </div>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button className="admin-topbar-mobile-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        </button>
                        <div>
                            <h1 className="admin-page-title">{pageTitle}</h1>
                        </div>
                    </div>
                    <div className="admin-topbar-right">
                        <div className="admin-search">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="M21 21L16.65 16.65"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search users, subjects..."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
