import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard/header.css';

export default function DashboardHeader({ stats, loading }) {
    const { language } = useLanguage();
    const { userProfile, firebaseUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const searchRef = useRef(null);

    const t = (ru, en) => language === 'ru' ? ru : en;

    const avatarSrc = userProfile?.photoURL || firebaseUser?.photoURL;
    const displayName = userProfile?.fullName || firebaseUser?.displayName || 'User';
    const progressPercent = stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0;

    useEffect(() => {
        const handleClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <header className="dash-header">
            <div className="dash-header-left">
                <div className="dash-greeting">
                    <div className="dash-avatar-ring" onClick={() => navigate('/cabinet/profile')}>
                        <div className="dash-avatar">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Avatar" />
                            ) : (
                                <span>{displayName[0] || 'U'}</span>
                            )}
                        </div>
                        <div className="dash-avatar-glow"></div>
                    </div>
                    <div className="dash-greeting-text">
                        <h1 className="dash-greeting-title">
                            {t('Добро пожаловать', 'Welcome back')}, <span className="dash-greeting-name">{displayName}</span>
                        </h1>
                        <p className="dash-greeting-sub">
                            {userProfile?.role === 'student'
                                ? t('Продолжай учиться и развиваться', 'Keep learning and growing')
                                : t('Управляй своим классом', 'Manage your classroom')
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="dash-header-right">
                <div className={`dash-search ${searchOpen ? 'open' : ''}`} ref={searchRef}>
                    <button className="dash-icon-btn dash-search-toggle" onClick={() => setSearchOpen(!searchOpen)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </button>
                    <input
                        type="text"
                        className="dash-search-input"
                        placeholder={t('Поиск...', 'Search...')}
                    />
                </div>

                <div className="dash-xp-display">
                    <svg className="dash-xp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div className="dash-xp-info">
                        <span className="dash-xp-level">{t('Уровень', 'Level')} {Math.floor(stats.courses / 3 + 1) || 1}</span>
                        <div className="dash-xp-bar">
                            <div className="dash-xp-fill" style={{ width: `${loading ? 0 : progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="dash-notif-wrapper">
                    <button className="dash-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <span className="dash-notif-dot"></span>
                    </button>
                    {notifOpen && (
                        <div className="dash-notif-dropdown">
                            <div className="dash-notif-header">
                                <span>{t('Уведомления', 'Notifications')}</span>
                                <button className="dash-notif-clear">{t('Очистить', 'Clear')}</button>
                            </div>
                            <div className="dash-notif-empty">
                                {t('Нет новых уведомлений', 'No new notifications')}
                            </div>
                        </div>
                    )}
                </div>

                <button className="dash-icon-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    )}
                </button>

                <button className="dash-icon-btn dash-logout-btn" onClick={() => { logout(); navigate('/'); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                </button>
            </div>
        </header>
    );
}
