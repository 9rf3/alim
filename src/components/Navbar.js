import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const { toggleTheme } = useTheme();
    const { language, changeLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileSearchValue, setMobileSearchValue] = useState('');
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const hamburgerRef = useRef(null);
    const mobileSearchRef = useRef(null);

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

    const photoUrl = localStorage.getItem('userPhoto') || user?.photoURL;
    const isAdmin = user?.email === 'admin@alimlab.com';

    const pathname = location.pathname;
    const isAuthPage = ['/signin', '/profile-setup', '/dashboard', '/profile'].includes(pathname);

    const navLinks = isAuthPage
        ? [
            { href: '/', label: t('nav.home', 'Home'), active: pathname === '/' },
            { href: '/dashboard', label: t('nav.dashboard', 'Dashboard'), active: pathname === '/dashboard' },
            { href: '/profile', label: t('nav.profile', 'Profile'), active: pathname === '/profile' },
        ]
        : [
            { href: '/', label: t('nav.home'), active: pathname === '/' },
            { href: '#labs', label: t('nav.labs'), active: false },
            { href: '/demo', label: t('nav.demo'), active: pathname === '/demo' },
            { href: '#features', label: t('nav.features'), active: false },
            { href: '#about', label: t('nav.about'), active: false },
            { href: '#contact', label: t('nav.contact'), active: false },
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
                    <a href="/" className="logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3" strokeLinecap="round"/>
                            <path d="M6 8H18" strokeLinecap="round"/>
                            <path d="M7 3H17" strokeLinecap="round"/>
                        </svg>
                        <span className="logo-text">Alim-lab</span>
                    </a>

                    <div className="nav-links">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className={`nav-link ${link.active ? 'active' : ''}`}
                            >
                                <span>{link.label}</span>
                                <div className="nav-link-line"></div>
                            </a>
                        ))}
                    </div>

                    <div className="nav-actions nav-actions-desktop">
                        <div className="search-wrapper">
                            <button
                                className="icon-btn search-btn"
                                id="searchBtn"
                                onClick={() => document.getElementById('searchModal')?.classList.add('active')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="M21 21L16.65 16.65"/>
                                </svg>
                            </button>
                        </div>

                        <button
                            className="theme-toggle theme-toggle-desktop"
                            aria-label={language === 'ru' ? 'Переключить тему' : 'Toggle theme'}
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

                        <div className="language-selector language-selector-desktop">
                            <button
                                className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
                                onClick={() => changeLanguage('ru')}
                            >
                                RU
                            </button>
                            <button
                                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                                onClick={() => changeLanguage('en')}
                            >
                                EN
                            </button>
                        </div>

                        {user ? (
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
                                                <span>{user.displayName?.[0] || 'U'}</span>
                                            )}
                                        </div>
                                        <span className="auth-user-name">
                                            {user.displayName || 'User'}
                                        </span>
                                        <svg className={`auth-dropdown-arrow ${dropdownOpen ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"/>
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="auth-dropdown-menu">
                                            <a href="/profile" className="auth-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="12" cy="7" r="4"/>
                                                </svg>
                                                {t('nav.profile', 'Profile')}
                                            </a>
                                            <a href="/dashboard" className="auth-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="7" height="7"/>
                                                    <rect x="14" y="3" width="7" height="7"/>
                                                    <rect x="14" y="14" width="7" height="7"/>
                                                    <rect x="3" y="14" width="7" height="7"/>
                                                </svg>
                                                {t('nav.dashboard', 'Dashboard')}
                                            </a>
                                            <div className="auth-dropdown-divider"></div>
                                            <button className="auth-dropdown-item logout-item" onClick={handleLogout}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                    <polyline points="16 17 21 12 16 7"/>
                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                </svg>
                                                {t('nav.logout', 'Log out')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="auth-container">
                                <a href="/signin" className="auth-login-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    {t('auth.login')}
                                </a>
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
                                    placeholder={language === 'ru' ? 'Поиск по лаборатории...' : 'Search the lab...'}
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
                                <span>{language === 'ru' ? 'Поиск' : 'Search'}</span>
                            </button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <div className="mobile-menu-section">
                        <div className="mobile-menu-label">Navigation</div>
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className={`mobile-menu-item ${link.active ? 'active' : ''}`}
                                onClick={handleMobileNavClick}
                            >
                                <span>{link.label}</span>
                                {link.active && <div className="mobile-menu-active-dot"></div>}
                            </a>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="mobile-menu-section">
                        <div className="mobile-menu-label">Settings</div>
                        <button className="mobile-menu-item mobile-theme-toggle" onClick={toggleTheme}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5"/>
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                            </svg>
                            <span>{language === 'ru' ? 'Тема' : 'Theme'}</span>
                            <div className="mobile-theme-indicator">
                                <div className="mobile-theme-track">
                                    <div className={`mobile-theme-thumb ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : ''}`}></div>
                                </div>
                            </div>
                        </button>

                        <button className="mobile-menu-item mobile-lang-toggle" onClick={() => changeLanguage(language === 'ru' ? 'en' : 'ru')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            <span>{language === 'ru' ? 'Русский' : 'English'}</span>
                        </button>
                    </div>

                    {/* User Section */}
                    {user && (
                        <>
                            <div className="mobile-menu-divider"></div>
                            <div className="mobile-menu-section mobile-user-section">
                                <div className="mobile-user-info">
                                    <div className="mobile-user-avatar">
                                        {photoUrl ? (
                                            <img src={photoUrl} alt="Avatar" />
                                        ) : (
                                            <span>{user.displayName?.[0] || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="mobile-user-details">
                                        <div className="mobile-user-name">{user.displayName || 'User'}</div>
                                        <div className="mobile-user-email">{user.email}</div>
                                    </div>
                                </div>
                                <a href="/profile" className="mobile-menu-item" onClick={handleMobileNavClick}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    <span>{t('nav.profile', 'Profile')}</span>
                                </a>
                                <a href="/dashboard" className="mobile-menu-item" onClick={handleMobileNavClick}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7"/>
                                        <rect x="14" y="3" width="7" height="7"/>
                                        <rect x="14" y="14" width="7" height="7"/>
                                        <rect x="3" y="14" width="7" height="7"/>
                                    </svg>
                                    <span>{t('nav.dashboard', 'Dashboard')}</span>
                                </a>
                                {isAdmin && (
                                    <a href="/admin" className="mobile-menu-item" onClick={handleMobileNavClick}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                        </svg>
                                        <span>Admin Panel</span>
                                    </a>
                                )}
                                <div className="mobile-menu-divider"></div>
                                <button className="mobile-menu-item mobile-logout-btn" onClick={handleLogout}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                        <polyline points="16 17 21 12 16 7"/>
                                        <line x1="21" y1="12" x2="9" y2="12"/>
                                    </svg>
                                    <span>{t('nav.logout', 'Log out')}</span>
                                </button>
                            </div>
                        </>
                    )}

                    {!user && (
                        <>
                            <div className="mobile-menu-divider"></div>
                            <div className="mobile-menu-section mobile-auth-section">
                                <a href="/signin" className="mobile-menu-item mobile-signin-btn" onClick={handleMobileNavClick}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    <span>{t('auth.login', 'Sign in')}</span>
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
