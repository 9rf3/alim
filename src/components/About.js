import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
    const { t } = useLanguage();

    const aboutList = [
        { text: t('about.list1') },
        { text: t('about.list2') },
        { text: t('about.list3') },
    ];

    return (
        <section className="about" id="about">
            <div className="section-container">
                <div className="about-grid">
                    <div className="about-content">
                        <span className="section-badge">{t('about.badge')}</span>
                        <h2 className="section-title">
                            <span>{t('about.title')}</span>
                            <span className="gradient-text"> {t('about.titleGradient')}</span>
                        </h2>
                        <p className="about-text">{t('about.description')}</p>
                        <ul className="about-list">
                            {aboutList.map((item, index) => (
                                <li key={index}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="about-visual">
                        <div className="glass-card">
                            <div className="lab-preview">
                                <div className="preview-element flask-float">
                                    <span>⚗️</span>
                                </div>
                                <div className="preview-element tube-float">
                                    <span>🧪</span>
                                </div>
                                <div className="preview-element atom-float">
                                    <span>⚛️</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}