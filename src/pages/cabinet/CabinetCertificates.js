import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { getCertificatesByUser } from '../../services/firestore';

export default function CabinetCertificates() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadCertificates = async () => {
            try {
                const certs = await getCertificatesByUser(userProfile.uid);
                if (!isMounted) return;
                setCertificates(certs);
            } catch (err) {
                console.error('[CabinetCertificates] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки сертификатов', 'Error loading certificates'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCertificates();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const achievementBadges = [
        { name: t('Первый шаг', 'First Step'), icon: '🎯', description: t('Завершили первый урок', 'Completed first lesson') },
        { name: t('Химик-любитель', 'Amateur Chemist'), icon: '⚗️', description: t('Прошли курс химии', 'Completed chemistry course') },
        { name: t('Физик', 'Physicist'), icon: '⚡', description: t('Прошли курс физики', 'Completed physics course') },
    ];

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header">
                    <h1>{t('Сертификаты', 'Certificates')}</h1>
                </div>
                <div className="cabinet-empty">
                    <p>{t('Загрузка...', 'Loading...')}</p>
                </div>
            </CabinetLayout>
        );
    }

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

            {error && (
                <div className="cabinet-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}

            <div className="cabinet-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Значки достижений', 'Achievement Badges')}
                </h3>
                <div className="cabinet-grid cabinet-grid-3">
                    {achievementBadges.map((badge, idx) => (
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
                {certificates.length === 0 ? (
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                        </svg>
                        <h3>{t('Пока нет сертификатов', 'No certificates yet')}</h3>
                        <p>{t('Завершите курс, чтобы получить сертификат', 'Complete a course to earn a certificate')}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {certificates.map((cert) => (
                            <div key={cert.id} style={{
                                padding: '20px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div>
                                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                            {cert.courseName || cert.title || t('Сертификат', 'Certificate')}
                                        </h4>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                                            {t('Выдан', 'Issued')}: {cert.issuedAt ? new Date(cert.issuedAt.toDate ? cert.issuedAt.toDate() : cert.issuedAt).toLocaleDateString() : t('Неизвестно', 'Unknown')}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '6px 12px',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#10B981',
                                    }}>
                                        {cert.score ? `${cert.score}%` : t('Завершён', 'Completed')}
                                    </div>
                                </div>
                                {cert.description && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>
                                        {cert.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CabinetLayout>
    );
}
