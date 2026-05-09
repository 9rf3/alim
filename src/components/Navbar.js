import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLab } from '../contexts/LabContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Navbar() {
    const { toggleTheme } = useTheme();
    const { userProfile, firebaseUser, logout } = useAuth();
    const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } = useLab();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileSearchValue, setMobileSearchValue] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const hamburgerRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const toggleMobileMenu = (e) => {
        e.stopPropagation();
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setMobileSearchValue('');
    };

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        navigate('/');
    };

    const handleMobileNavClick = () => {
        setMobileMenuOpen(false);
    };

    const photoUrl = localStorage.getItem('userPhoto') || userProfile?.photoURL || firebaseUser?.photoURL;
    const isAdminUser = userProfile?.role === 'admin';

    const pathname = location.pathname;

    const navLinks = firebaseUser
        ? [
            { type: 'link', href: userProfile?.role === 'teacher' ? '/teacher' : '/cabinet', label: 'Кабинет', active: pathname.startsWith('/cabinet') || pathname.startsWith('/teacher') },
            { type: 'link', href: '/cabinet/laboratory', label: 'Лаборатории', active: pathname === '/cabinet/laboratory' },
            { type: 'link', href: '/cabinet/profile', label: 'Профиль', active: pathname === '/cabinet/profile' },
        ]
        : [
            { type: 'link', href: '/', label: 'Главная', active: pathname === '/' },
            { type: 'hash', href: '#features', label: 'Возможности', active: false },
            { type: 'hash', href: '#about', label: 'О нас', active: false },
            { type: 'hash', href: '#contact', label: 'Контакты', active: false },
            { type: 'link', href: '/signin', label: 'Лаборатории', active: false },
            { type: 'link', href: '/signin', label: 'Демо', active: false },
        ];

    const handleMobileSearch = (e) => {
        e.preventDefault();
        if (mobileSearchValue.trim()) {
            closeMobileMenu();
        }
    };

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
                <div className="nav-container">
                    <Link to="/" className="logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3" strokeLinecap="round"/>
                            <path d="M6 8H18" strokeLinecap="round"/>
                            <path d="M7 3H17" strokeLinecap="round"/>
                        </svg>
                        <span className="logo-text">Alim-lab</span>
                    </Link>

                    <div className="nav-links">
                        {navLinks.map((link, index) =>
                            link.type === 'hash' ? (
                                <a
                                    key={index}
                                    href={link.href}
                                    className={`nav-link ${link.active ? 'active' : ''}`}
                                >
                                    <span>{link.label}</span>
                                    <div className="nav-link-line"></div>
                                </a>
                            ) : (
                                <Link
                                    key={index}
                                    to={link.href}
                                    className={`nav-link ${link.active ? 'active' : ''}`}
                                >
                                    <span>{link.label}</span>
                                    <div className="nav-link-line"></div>
                                </Link>
                            )
                        )}
                    </div>

                    <div className="nav-actions nav-actions-desktop">
                        <div className="search-wrapper">
                            <button
                                className="icon-btn search-btn"
                                id="searchBtn"
                                onClick={() => {
                                    const modal = document.getElementById('searchModal');
                                    if (modal) {
                                        modal.classList.add('active');
                                        setTimeout(() => {
                                            const input = document.getElementById('searchModalInput');
                                            input?.focus();
                                        }, 100);
                                    }
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="M21 21L16.65 16.65"/>
                                </svg>
                            </button>
                        </div>

                        {firebaseUser && (
                            <div className="notif-wrapper" ref={notifRef}>
                                <button
                                    className="icon-btn notif-btn"
                                    onClick={() => setNotifOpen(!notifOpen)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                    </svg>
                                    {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                </button>

                                {notifOpen && (
                                    <div className="notif-dropdown">
                                        <div className="notif-header">
                                            <h4>Уведомления</h4>
                                            <div className="notif-actions">
                                                {notifications.length > 0 && (
                                                    <button onClick={() => { markAllNotificationsRead(); }}>Прочитать все</button>
                                                )}
                                                {notifications.length > 0 && (
                                                    <button onClick={() => { clearAllNotifications(); }}>Очистить</button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="notif-list">
                                            {notifications.length === 0 ? (
                                                <div className="notif-empty">Нет уведомлений</div>
                                            ) : (
                                                notifications.slice(0, 10).map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                                                        onClick={() => { markNotificationRead(notif.id); if (notif.linkTo) navigate(notif.linkTo); setNotifOpen(false); }}
                                                    >
                                                        <div className="notif-icon">
                                                            {notif.type === 'subject' && '📚'}
                                                            {notif.type === 'course' && '🎓'}
                                                            {notif.type === 'teacher' && '👨‍🏫'}
                                                            {notif.type === 'new_course' && '✨'}
                                                            {notif.type === 'lesson_update' && '📝'}
                                                        </div>
                                                        <div className="notif-content">
                                                            <div className="notif-title">{notif.title}</div>
                                                            <div className="notif-message">{notif.message}</div>
                                                            <div className="notif-time">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>
                                                        <button
                                                            className="notif-delete"
                                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="theme-toggle theme-toggle-desktop"
                            aria-label="Переключить тему"
                            onClick={toggleTheme}
                        >
                            <div className="theme-toggle-track">
                                <div className="theme-toggle-thumb">
                                    <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"/>
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                                    </svg>
                                    <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {firebaseUser ? (
                            <>
                                <div className="auth-user-dropdown" ref={dropdownRef}>
                                    <button
                                        className="auth-user-btn auth-user-desktop"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <div className="auth-avatar">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt="Avatar" />
                                            ) : (
                                                <span>{userProfile?.displayName || firebaseUser?.displayName || 'U'}</span>
                                            )}
                                        </div>
                                        <span className="auth-user-name">
                                            {userProfile?.fullName || firebaseUser?.displayName || 'User'}
                                        </span>
                                        <svg className={`auth-dropdown-arrow ${dropdownOpen ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"/>
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="auth-dropdown-menu">
                                            {userProfile?.role === 'teacher' && (
                                                <Link to="/teacher" className="auth-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                                    </svg>
                                                    Кабинет
                                                </Link>
                                            )}
                                            {userProfile?.role === 'student' && (
                                                <Link to="/cabinet" className="auth-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                                                    </svg>
                                                    Кабинет
                                                </Link>
                                            )}
                                            <Link to="/cabinet/profile" className="auth-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="12" cy="7" r="4"/>
                                                </svg>
                                                Профиль
                                            </Link>

                                            {userProfile?.role === 'admin' && (
                                                <>
                                                    <div className="auth-dropdown-divider"></div>
                                                    <Link to="/a/ctrl" className="auth-dropdown-item" onClick={() => setDropdownOpen(false)} style={{ color: '#EF4444' }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="3"/>
                                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                                        </svg>
                                                        Админ панель
                                                    </Link>
                                                </>
                                            )}
                                            <div className="auth-dropdown-divider"></div>
                                            <button className="auth-dropdown-item logout-item" onClick={handleLogout}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                    <polyline points="16 17 21 12 16 7"/>
                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                </svg>
                                                Выйти
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="auth-container">
                                 <Link to="/signin" className="auth-login-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    Войти
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        ref={hamburgerRef}
                        className="mobile-menu-btn"
                        onClick={toggleMobileMenu}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {mobileMenuOpen ? (
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
            </nav>

                    {/* Mobile Menu Overlay */}
                    <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>

                    {/* Mobile Menu */}
                    <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
                        <div className="mobile-menu-scroll">
                            {/* Search Section */}
                            <div className="mobile-menu-section mobile-search-section">
                                {mobileSearchOpen ? (
                                    <form className="mobile-search-form" onSubmit={handleMobileSearch} ref={mobileSearchRef}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="M21 21L16.65 16.65"/>
                                        </svg>
                                        <input
                                            type="text"
                                            className="mobile-search-input"
                                            placeholder="Поиск по лаборатории..."
                                            value={mobileSearchValue}
                                            onChange={(e) => setMobileSearchValue(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="button" className="mobile-search-close" onClick={() => setMobileSearchOpen(false)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>
                                    </form>
                                ) : (
                                    <button className="mobile-menu-item mobile-search-btn" onClick={() => setMobileSearchOpen(true)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="M21 21L16.65 16.65"/>
                                        </svg>
                                        <span>Поиск</span>
                                    </button>
                                )}
                            </div>

                            {firebaseUser && unreadCount > 0 && (
                                <div className="mobile-menu-section mobile-notif-section">
                                    <button
                                        className="mobile-menu-item mobile-notif-btn"
                                        onClick={() => { navigate('/cabinet/laboratory'); closeMobileMenu(); }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                        </svg>
                                        <span>Уведомления</span>
                                        <span className="mobile-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    </button>
                                </div>
                            )}

                            <div className="mobile-menu-section">
                                <div className="mobile-menu-label">Навигация</div>
                                {navLinks.map((link, index) =>
                                    link.type === 'hash' ? (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className={`mobile-menu-item ${link.active ? 'active' : ''}`}
                                            onClick={closeMobileMenu}
                                        >
                                            <span>{link.label}</span>
                                            {link.active && <div className="mobile-menu-active-dot"></div>}
                                        </a>
                                    ) : (
                                        <Link
                                            key={index}
                                            to={link.href}
                                            className={`mobile-menu-item ${link.active ? 'active' : ''}`}
                                            onClick={handleMobileNavClick}
                                        >
                                            <span>{link.label}</span>
                                            {link.active && <div className="mobile-menu-active-dot"></div>}
                                        </Link>
                                    )
                                )}
                            </div>

                    {/* Controls */}
                    <div className="mobile-menu-section">
                        <div className="mobile-menu-label">Настройки</div>
                        <button className="mobile-menu-item mobile-theme-toggle" onClick={toggleTheme}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5"/>
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                            </svg>
                            <span>Тема</span>
                            <div className="mobile-theme-indicator">
                                <div className="mobile-theme-track">
                                    <div className={`mobile-theme-thumb ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : ''}`}></div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* User Section */}
                    {firebaseUser && (
                        <>
                            <div className="mobile-menu-divider"></div>
                            <div className="mobile-menu-section mobile-user-section">
                                <div className="mobile-user-info">
                                    <div className="mobile-user-avatar">
                                        {photoUrl ? (
                                            <img src={photoUrl} alt="Avatar" />
                                        ) : (
                                            <span>{userProfile?.fullName || firebaseUser?.displayName || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="mobile-user-details">
                                        <div className="mobile-user-name">{userProfile?.fullName || firebaseUser?.displayName || 'User'}</div>
                                        <div className="mobile-user-email">{firebaseUser?.email}</div>
                                    </div>
                                </div>
                                <Link to="/cabinet/profile" className="mobile-menu-item" onClick={handleMobileNavClick}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    <span>Профиль</span>
                                </Link>

                                {isAdminUser && (
                                     <Link to="/a/ctrl" className="mobile-menu-item" onClick={handleMobileNavClick}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                        </svg>
                                        <span>Админ панель</span>
                                    </Link>
                                )}
                                <div className="mobile-menu-divider"></div>
                                <button className="mobile-menu-item mobile-logout-btn" onClick={handleLogout}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                        <polyline points="16 17 21 12 16 7"/>
                                        <line x1="21" y1="12" x2="9" y2="12"/>
                                    </svg>
                                    <span>Выйти</span>
                                </button>
                            </div>
                        </>
                    )}

                    {!firebaseUser && (
                        <>
                            <div className="mobile-menu-divider"></div>
                            <div className="mobile-menu-section mobile-auth-section">
                                <Link to="/signin" className="mobile-menu-item mobile-signin-btn" onClick={handleMobileNavClick}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    <span>Войти</span>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
