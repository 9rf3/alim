import { useLanguage } from '../contexts/LanguageContext';

export default function Features() {
    const { t } = useLanguage();

    const features = [
        {
            icon: (
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
            ),
            title: t('features.card1Title'),
            description: t('features.card1Desc'),
        },
        {
            icon: (
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            ),
            title: t('features.card2Title'),
            description: t('features.card2Desc'),
            blue: true,
        },
        {
            icon: (
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            ),
            title: t('features.card3Title'),
            description: t('features.card3Desc'),
            purple: true,
        },
    ];

    return (
        <section className="features" id="features">
            <div className="section-container">
                <div className="section-header">
                    <span className="section-badge">{t('features.badge')}</span>
                    <h2 className="section-title">
                        <span>{t('features.title')}</span>
                        <span className="gradient-text"> {t('features.titleGradient')}</span>
                    </h2>
                    <p className="section-description">{t('features.description')}</p>
                </div>
                
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className={`feature-icon-wrapper ${feature.blue ? 'blue' : ''} ${feature.purple ? 'purple' : ''}`}>
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}