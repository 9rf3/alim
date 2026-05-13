import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getTeacherStats } from '../../services/firestore';

export default function TeacherEarnings() {
    const { userProfile } = useAuth();
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const teacherStats = await getTeacherStats(userProfile.uid);
                if (!isMounted) return;
                setStats(teacherStats);
            } catch (err) {
                console.error('[TeacherEarnings] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки данных', 'Error loading data'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    if (loading) {
        return (
            <TeacherLayout>
                <div className="teacher-header">
                    <h1>{t('Доходы', 'Earnings')}</h1>
                </div>
                <div className="teacher-empty">
                    <p>{t('Загрузка...', 'Loading...')}</p>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Доходы', 'Earnings')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Отслеживайте заработок и транзакции', 'Track earnings and transactions')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="teacher-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}

            <div className="teacher-stats-row">
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Курсы', 'Courses')}</div>
                    <div className="teacher-stat-value">{stats?.courses || 0}</div>
                    <div className="teacher-stat-change">{t('Создано', 'Created')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Ученики', 'Students')}</div>
                    <div className="teacher-stat-value">{stats?.students || 0}</div>
                    <div className="teacher-stat-change">{t('Записано', 'Enrolled')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Видео', 'Videos')}</div>
                    <div className="teacher-stat-value">{stats?.videos || 0}</div>
                    <div className="teacher-stat-change">{t('Загружено', 'Uploaded')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Рейтинг', 'Rating')}</div>
                    <div className="teacher-stat-value">{stats?.rating || '—'}</div>
                    <div className="teacher-stat-change">{stats?.reviews || 0} {t('отзывов', 'reviews')}</div>
                </div>
            </div>

            <div className="teacher-card" style={{ marginBottom: '32px' }}>
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '16px',
                }}>
                    <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {t('Модуль доходов в разработке', 'Revenue module coming soon')}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                        {t('Полная система отслеживания доходов, транзакций и выплат будет доступна в ближайшее время.', 'A complete revenue tracking, transaction history, and payout system will be available soon.')}
                    </p>
                </div>
            </div>

            <div className="teacher-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('История транзакций', 'Transaction History')}
                </h3>
                <div className="teacher-empty">
                    <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <h3>{t('Нет транзакций', 'No transactions')}</h3>
                    <p>{t('Транзакции появятся после подключения платёжной системы', 'Transactions will appear after the payment system is connected')}</p>
                </div>
            </div>
        </TeacherLayout>
    );
}
