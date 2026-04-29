import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    const footerLinks = [
        { href: '#home', label: t('footer.home') },
        { href: '#features', label: t('footer.features') },
        { href: '#about', label: t('footer.about') },
        { href: '#contact', label: t('footer.contact') },
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M6 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M8 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="17" r="2" fill="currentColor"/>
                        </svg>
                        <span className="logo-text">Alim-lab</span>
                    </div>
                    <p className="footer-tagline">{t('footer.tagline')}</p>
                </div>
                <div className="footer-links">
                    {footerLinks.map((link, index) => (
                        <a key={index} href={link.href}>{link.label}</a>
                    ))}
                </div>
                <p className="footer-copyright">{t('footer.copyright')}</p>
            </div>
        </footer>
    );
}