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
    const [searchExpanded, setSearchExpanded] = useState(false);
    const searchWrapperRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
                setSearchExpanded(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
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
        const handleClickOutside = (e) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const photoUrl = localStorage.getItem('userPhoto') || user?.photoURL;

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const pathname = location.pathname;
    const isAuthPage = ['/signin', '/profile-setup', '/dashboard', '/profile'].includes(pathname);

    const navLinks = isAuthPage
        ? [
            { href: '/', label: t('nav.home', 'Home'), active: pathname === '/' },
            { href: '/dashboard', label: t('nav.dashboard', 'Dashboard'), active: pathname === '/dashboard' },
            { href: '/profile', label: t('nav.profile', 'Profile'), active: pathname === '/profile' },
        ]
        : [
            { href: '/', label: t('nav.home'), active: true },
            { href: '#labs', label: t('nav.labs') },
            { href: '/demo', label: t('nav.demo') },
            { href: '#features', label: t('nav.features') },
            { href: '#about', label: t('nav.about') },
            { href: '#contact', label: t('nav.contact') },
        ];

    return (
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

                <div className="nav-actions">
                    <div className={`search-wrapper ${searchExpanded ? 'expanded' : ''}`} ref={searchWrapperRef}>
                        <button
                            className="icon-btn search-btn"
                            id="searchBtn"
                            onClick={() => setSearchExpanded(!searchExpanded)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="M21 21L16.65 16.65"/>
                            </svg>
                        </button>
                        <input
                            type="text"
                            className={`search-input ${searchExpanded ? 'active' : ''}`}
                            placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
                        />
                    </div>

                    <button
                        className="theme-toggle"
                        id="themeToggle"
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

                    <div className="language-selector">
                        <button
                            className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
                            onClick={() => changeLanguage('ru')}
                            data-lang="ru"
                        >
                            RU
                        </button>
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => changeLanguage('en')}
                            data-lang="en"
                        >
                            EN
                        </button>
                    </div>

                    {user ? (
                        <>
                            <button
                                className="mobile-menu-btn"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                ref={mobileMenuRef}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                            <div className="auth-user-dropdown" ref={dropdownRef}>
                                <button
                                    className="auth-user-btn"
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
                                        <a
                                            href="/profile"
                                            className="auth-dropdown-item"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            {t('nav.profile', 'Profile')}
                                        </a>
                                        <a
                                            href="/dashboard"
                                            className="auth-dropdown-item"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="7" height="7"/>
                                                <rect x="14" y="3" width="7" height="7"/>
                                                <rect x="14" y="14" width="7" height="7"/>
                                                <rect x="3" y="14" width="7" height="7"/>
                                            </svg>
                                            {t('nav.dashboard', 'Dashboard')}
                                        </a>
                                        <div className="auth-dropdown-divider"></div>
                                        <button
                                            className="auth-dropdown-item logout-item"
                                            onClick={handleLogout}
                                        >
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
                        <div className="auth-container" id="authContainer">
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
            </div>

            {mobileMenuOpen && user && isAuthPage && (
                <div className="mobile-menu">
                    <a href="/" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        {t('nav.home', 'Home')}
                    </a>
                    <a href="/dashboard" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        {t('nav.dashboard', 'Dashboard')}
                    </a>
                    <a href="/profile" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {t('nav.profile', 'Profile')}
                    </a>
                    <div className="mobile-menu-divider"></div>
                    <div className="mobile-menu-user">
                        <div className="mobile-menu-avatar">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Avatar" />
                            ) : (
                                <span>{user.displayName?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div>
                            <div className="mobile-menu-name">{user.displayName || 'User'}</div>
                            <div className="mobile-menu-email">{user.email}</div>
                        </div>
                    </div>
                    <button className="mobile-menu-item logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        {t('nav.logout', 'Log out')}
                    </button>
                </div>
            )}
        </nav>
    );
}
