import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/main.css';

export default function SignIn() {
    const { language } = useLanguage();
    const { user, login, loading } = useAuth();
    const navigate = useNavigate();
    const [termsChecked, setTermsChecked] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const termsWrapperRef = useRef(null);

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            if (user.profileComplete) {
                navigate('/labs');
            } else {
                navigate('/profile-setup');
            }
        }
    }, [user, loading, navigate]);

    // Create background particles on mount
    useEffect(() => {
        const container = document.getElementById('particles');
        if (!container) return;

        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (15 + Math.random() * 20) + 's';
            particle.style.animationDelay = (Math.random() * 20) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            container.appendChild(particle);
        }

        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, []);

    // Handle terms checkbox styling
    useEffect(() => {
        const termsWrapper = termsWrapperRef.current;
        if (!termsWrapper) return;

        if (termsChecked) {
            termsWrapper.classList.add('checked');
        } else {
            termsWrapper.classList.remove('checked');
        }
    }, [termsChecked]);

    const handleGoogleSignIn = async () => {
        if (!termsChecked || googleLoading) return;

        setGoogleLoading(true);

        try {
            await login();
            // AuthContext will handle the redirect via the useEffect above
        } catch (error) {
            console.error('Login error:', error);
            setGoogleLoading(false);

            // Handle specific errors silently
            if (error.code === 'auth/popup-closed-by-user') {
                // Silent
            } else if (error.code === 'auth/cancelled-popup-request') {
                // Silent
            } else {
                alert(
                    language === 'ru'
                        ? 'Ошибка входа: ' + (error.message || 'Попробуйте ещё раз')
                        : 'Sign in error: ' + (error.message || 'Please try again')
                );
            }
        }
    };

    const continueWithoutSignIn = () => {
        navigate('/demo');
    };

    const t = (ruText, enText) => language === 'ru' ? ruText : enText;

    if (loading) {
        return (
            <div className="signin-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="signin-page">
            <div className="bg-particles" id="particles"></div>
            <div className="glow-orb glow-orb-1"></div>
            <div className="glow-orb glow-orb-2"></div>

            <div className="signin-card">
                <svg className="sparkle sparkle-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
                <svg className="sparkle sparkle-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
                <svg className="sparkle sparkle-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>

                <div className="logo-wrapper">
                    <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3" strokeLinecap="round" />
                        <path d="M6 8H18" strokeLinecap="round" />
                        <path d="M7 3H17" strokeLinecap="round" />
                    </svg>
                </div>

                <h1 className="title">{t('Добро пожаловать', 'Welcome')}</h1>
                <p className="subtitle">
                    {t('Войдите через Google, чтобы сохранять эксперименты и получить доступ ко всем функциям',
                        'Sign in with Google to save experiments and access all features')}
                </p>

                <label
                    className={`terms-checkbox-wrapper ${termsChecked ? 'checked' : ''}`}
                    id="termsWrapper"
                    ref={termsWrapperRef}
                >
                    <input
                        type="checkbox"
                        className="terms-checkbox"
                        id="termsCheckbox"
                        checked={termsChecked}
                        onChange={(e) => setTermsChecked(e.target.checked)}
                    />
                    <span className="terms-checkbox-label">
                        {t(
                            <>Я согласен с <a href="/legal" target="_blank">условиями использования</a> и <a href="/legal" target="_blank">политикой конфиденциальности</a></>,
                            <>I agree to <a href="/legal" target="_blank">Terms of Service</a> and <a href="/legal" target="_blank">Privacy Policy</a></>
                        )}
                    </span>
                </label>

                <button
                    className="google-btn"
                    id="googleBtn"
                    disabled={!termsChecked || googleLoading}
                    onClick={handleGoogleSignIn}
                >
                    {googleLoading ? (
                        <span>{t('Вход...', 'Signing in...')}</span>
                    ) : (
                        <>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {t('Войти через Google', 'Sign in with Google')}
                        </>
                    )}
                </button>

                <div className="divider">
                    {t('или', 'or')}
                </div>

                <button className="skip-btn" onClick={continueWithoutSignIn}>
                    {t('Продолжить без входа', 'Continue without sign in')}
                </button>

                <Link to="/" className="back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {t('Вернуться на главную', 'Back to home')}
                </Link>
            </div>
        </div>
    );
}
