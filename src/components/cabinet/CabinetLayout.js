import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import Timer from '../../components/Timer';
import '../../styles/cabinet.css';

const navSections = [
    {
        label: 'Главное',
        labelEn: 'Main',
        items: [
            { id: 'overview', path: '/cabinet', icon: 'grid', label: 'Обзор', labelEn: 'Overview' },
            { id: 'profile', path: '/cabinet/profile', icon: 'user', label: 'Профиль', labelEn: 'Profile' },
        ]
    },
    {
        label: 'Обучение',
        labelEn: 'Learning',
        items: [
            { id: 'laboratory', path: '/cabinet/laboratory', icon: 'flask', label: 'Лаборатория', labelEn: 'Laboratory' },
            { id: 'library', path: '/cabinet/library', icon: 'book', label: 'Библиотека', labelEn: 'Library' },
            { id: 'simulations', path: '/cabinet/simulations', icon: 'atom', label: 'Симуляции', labelEn: 'Simulations' },
            { id: 'editor', path: '/cabinet/editor', icon: 'edit', label: 'Редактор', labelEn: 'Editor' },
        ]
    },
    {
        label: 'Планирование',
        labelEn: 'Planning',
        items: [
            { id: 'studyplan', path: '/cabinet/study-plan', icon: 'calendar', label: 'Учебный план', labelEn: 'Study Plan' },
        ]
    },
    {
        label: 'Прогресс',
        labelEn: 'Progress',
        items: [
            { id: 'certificates', path: '/cabinet/certificates', icon: 'award', label: 'Сертификаты', labelEn: 'Certificates' },
            { id: 'data', path: '/cabinet/data', icon: 'chart', label: 'Мои данные', labelEn: 'My Data' },
        ]
    },
    {
        label: 'Маркетплейс',
        labelEn: 'Marketplace',
        items: [
            { id: 'payment', path: '/cabinet/payment', icon: 'credit-card', label: 'Подписка', labelEn: 'Subscription' },
            { id: 'marketplace', path: '/cabinet/marketplace', icon: 'shopping', label: 'Торговля', labelEn: 'Trading' },
        ]
    }
];

function getIcon(type, className) {
    const icons = {
        grid: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
        user: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        flask: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/><path d="M6 8H18"/><path d="M7 3H17"/></svg>,
        book: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
        atom: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 3c4.97 0 9 2.69 9 6s-4.03 6-9 6-9-2.69-9-6 4.03-6 9-6z"/><path d="M12 3c-4.97 0-9 2.69-9 6s4.03 6 9 6 9-2.69 9-6-4.03-6-9-6z"/></svg>,
        edit: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
        calendar: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
        award: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
        chart: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
        'credit-card': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
        shopping: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    };
    return icons[type] || null;
}

export default function CabinetLayout({ children }) {
    const { isAuthenticated, isOnboardingComplete, loading, userProfile, logout } = useAuth();
    console.log("ROLE:", userProfile?.role);
    const { language, changeLanguage } = useLanguage();
    const { toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) {
            navigate('/signin');
        } else if (!isOnboardingComplete) {
            navigate('/profile-setup');
        }
    }, [isAuthenticated, isOnboardingComplete, loading, navigate]);

    if (loading) return null;
    if (!isAuthenticated) return null;

    const photoUrl = localStorage.getItem('userPhoto') || userProfile?.photoURL;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="cabinet-page">
            <Timer />

            <div className={`cabinet-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            <aside className={`cabinet-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="cabinet-sidebar-header">
                    <Link to="/cabinet" className="cabinet-sidebar-logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3" strokeLinecap="round"/>
                            <path d="M6 8H18" strokeLinecap="round"/>
                            <path d="M7 3H17" strokeLinecap="round"/>
                        </svg>
                        <span className="cabinet-sidebar-logo-text">Alim-lab</span>
                    </Link>
                </div>

                <div className="cabinet-user-header">
                    <div className="cabinet-user-info">
                        <div className="cabinet-user-avatar">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Avatar" />
                            ) : (
                                <span>{userProfile?.fullName?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div className="cabinet-user-details">
                            <div className="cabinet-user-name">{userProfile?.fullName || 'User'}</div>
                            <div className="cabinet-user-role">
                                <span className="role-badge">
                                    {userProfile?.role === 'student'
                                        ? (language === 'ru' ? 'Ученик' : 'Student')
                                        : (language === 'ru' ? 'Учитель' : 'Teacher')
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="cabinet-nav">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="cabinet-nav-section">
                            <div className="cabinet-nav-label">
                                {language === 'ru' ? section.label : section.labelEn}
                            </div>
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={`cabinet-nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="cabinet-nav-icon">
                                            {getIcon(item.icon, 'cabinet-nav-icon')}
                                        </span>
                                        {language === 'ru' ? item.label : item.labelEn}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="cabinet-sidebar-footer">
                    {userProfile?.role === 'admin' && (
                        <Link to="/a/ctrl/dashboard" className="cabinet-sidebar-btn admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            {language === 'ru' ? 'Админ панель' : 'Admin Panel'}
                        </Link>
                    )}
                    <button className="cabinet-sidebar-btn" onClick={toggleTheme}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5"/>
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        {language === 'ru' ? 'Тема' : 'Theme'}
                    </button>
                    <button className="cabinet-sidebar-btn" onClick={() => changeLanguage(language === 'ru' ? 'en' : 'ru')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        {language === 'ru' ? 'English' : 'Русский'}
                    </button>
                    <button className="cabinet-sidebar-btn logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        {language === 'ru' ? 'Выйти' : 'Log out'}
                    </button>
                </div>
            </aside>

            <main className="cabinet-main">
                {children}
            </main>

            <button className="cabinet-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {sidebarOpen ? (
                        <>
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </>
                    ) : (
                        <>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </>
                    )}
                </svg>
            </button>
        </div>
    );
}
