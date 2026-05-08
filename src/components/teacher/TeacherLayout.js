import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import Timer from '../../components/Timer';
import '../../styles/teacher.css';

const navSections = [
    {
        label: 'Главное',
        labelEn: 'Main',
        items: [
            { id: 'overview', path: '/teacher', icon: 'grid', label: 'Обзор', labelEn: 'Overview' },
            { id: 'profile', path: '/profile', icon: 'user', label: 'Профиль', labelEn: 'Profile' },
        ]
    },
    {
        label: 'Контент',
        labelEn: 'Content',
        items: [
            { id: 'video', path: '/teacher/video', icon: 'video', label: 'Видео', labelEn: 'Video' },
            { id: 'quiz', path: '/teacher/quiz', icon: 'clipboard', label: 'Квизы', labelEn: 'Quizzes' },
            { id: 'resources', path: '/teacher/resources', icon: 'folder', label: 'Ресурсы', labelEn: 'Resources' },
        ]
    },
    {
        label: 'Бизнес',
        labelEn: 'Business',
        items: [
            { id: 'pricing', path: '/teacher/pricing', icon: 'dollar', label: 'Цены', labelEn: 'Pricing' },
            { id: 'earnings', path: '/teacher/earnings', icon: 'wallet', label: 'Доходы', labelEn: 'Earnings' },
            { id: 'laboratory', path: '/teacher/laboratory', icon: 'flask', label: 'Лаборатория', labelEn: 'Laboratory' },
        ]
    },
    {
        label: 'Управление',
        labelEn: 'Management',
        items: [
            { id: 'students', path: '/teacher/students', icon: 'users', label: 'Ученики', labelEn: 'Students' },
            { id: 'analytics', path: '/teacher/analytics', icon: 'analytics', label: 'Аналитика', labelEn: 'Analytics' },
        ]
    }
];

function getIcon(type, className) {
    const icons = {
        grid: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
        user: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        chart: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
        video: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
        clipboard: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
        folder: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
        dollar: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        wallet: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
        flask: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/><path d="M6 8H18"/><path d="M7 3H17"/></svg>,
        users: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
        analytics: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    };
    return icons[type] || null;
}

export default function TeacherLayout({ children }) {
    const { userProfile, isAuthenticated, isOnboardingComplete, loading, logout } = useAuth();
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
        } else if (userProfile?.role !== 'teacher') {
            navigate('/cabinet');
        }
    }, [userProfile, isAuthenticated, isOnboardingComplete, loading, navigate]);

    if (loading) return null;

    const photoUrl = localStorage.getItem('userPhoto') || userProfile?.photoURL;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="teacher-page">
            <Timer />

            <div className={`teacher-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            <aside className={`teacher-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="teacher-sidebar-header">
                    <Link to="/teacher" className="teacher-sidebar-logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3" strokeLinecap="round"/>
                            <path d="M6 8H18" strokeLinecap="round"/>
                            <path d="M7 3H17" strokeLinecap="round"/>
                        </svg>
                        <span className="teacher-sidebar-logo-text">Alim-lab</span>
                    </Link>
                </div>

                <div className="teacher-user-header">
                    <div className="teacher-user-info">
                        <div className="teacher-user-avatar">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Avatar" />
                            ) : (
                                <span>{userProfile?.fullName?.[0] || 'T'}</span>
                            )}
                        </div>
                        <div className="teacher-user-details">
                            <div className="teacher-user-name">{userProfile?.fullName || 'User'}</div>
                            <div className="teacher-user-role">
                                <span className="teacher-role-badge">
                                    {language === 'ru' ? 'Учитель' : 'Teacher'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="teacher-nav">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="teacher-nav-section">
                            <div className="teacher-nav-label">
                                {language === 'ru' ? section.label : section.labelEn}
                            </div>
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={`teacher-nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="teacher-nav-icon">
                                            {getIcon(item.icon, 'teacher-nav-icon')}
                                        </span>
                                        {language === 'ru' ? item.label : item.labelEn}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="teacher-sidebar-footer">
                    {userProfile?.role === 'admin' && (
                        <Link to="/a/ctrl/dashboard" className="teacher-sidebar-btn admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            {language === 'ru' ? 'Админ панель' : 'Admin Panel'}
                        </Link>
                    )}
                    <button className="teacher-sidebar-btn" onClick={toggleTheme}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5"/>
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        {language === 'ru' ? 'Тема' : 'Theme'}
                    </button>
                    <button className="teacher-sidebar-btn" onClick={() => changeLanguage(language === 'ru' ? 'en' : 'ru')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        {language === 'ru' ? 'English' : 'Русский'}
                    </button>
                    <button className="teacher-sidebar-btn logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        {language === 'ru' ? 'Выйти' : 'Log out'}
                    </button>
                </div>
            </aside>

            <main className="teacher-main">
                {children}
            </main>

            <button className="teacher-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
