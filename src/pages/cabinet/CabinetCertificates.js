import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetCertificates() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;

    const badges = [
        { name: t('Первый шаг', 'First Step'), icon: '🎯', description: t('Завершили первый урок', 'Completed first lesson') },
        { name: t('Химик-любитель', 'Amateur Chemist'), icon: '⚗️', description: t('Прошли курс химии', 'Completed chemistry course') },
        { name: t('Физик', 'Physicist'), icon: '⚡', description: t('Прошли курс физики', 'Completed physics course') },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Сертификаты', 'Certificates')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Ваши достижения и сертификаты', 'Your achievements and certificates')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="cabinet-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Значки достижений', 'Achievement Badges')}
                </h3>
                <div className="cabinet-grid cabinet-grid-3">
                    {badges.map((badge, idx) => (
                        <div key={idx} style={{
                            textAlign: 'center',
                            padding: '20px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{badge.icon}</div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {badge.name}
                            </h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {badge.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cabinet-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Сертификаты курсов', 'Course Certificates')}
                </h3>
                <div className="cabinet-empty">
                    <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                    </svg>
                    <h3>{t('Пока нет сертификатов', 'No certificates yet')}</h3>
                    <p>{t('Завершите курс, чтобы получить сертификат', 'Complete a course to earn a certificate')}</p>
                    <button className="cabinet-btn">{t('Найти курсы', 'Find Courses')}</button>
                </div>
            </div>
        </CabinetLayout>
    );
}
