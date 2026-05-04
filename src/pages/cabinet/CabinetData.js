import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { getStudentStats, getProgressByUser, getQuizAttemptsByUser } from '../../services/firestore';

export default function CabinetData() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const fetchData = async () => {
            try {
                const data = await getStudentStats(userProfile.uid);
                if (!isMounted) return;
                setStats(data);
            } catch (err) {
                console.error('[CabinetData] Error loading stats:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки', 'Error loading data'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header">
                    <h1>{t('Мои данные', 'My Data')}</h1>
                </div>
                <div className="cabinet-empty">
                    <p>{t('Загрузка...', 'Loading...')}</p>
                </div>
            </CabinetLayout>
        );
    }

    const studyHours = Math.round((stats?.videosWatched || 0) * 0.5 * 10) / 10;
    const subjectCount = userProfile?.subjects?.length || 0;

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Мои данные', 'My Data')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Полная аналитика вашего обучения', 'Complete analytics of your learning')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="cabinet-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}

            <div className="cabinet-grid cabinet-grid-3" style={{ marginBottom: '32px' }}>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Курсы', 'Courses')}</div>
                    <div className="cabinet-stat-value">{stats?.courses || 0}</div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Часы обучения', 'Study Hours')}</div>
                    <div className="cabinet-stat-value">{studyHours}</div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Средний балл', 'Average Score')}</div>
                    <div className="cabinet-stat-value">{stats?.avgScore ? `${stats.avgScore}%` : '—'}</div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Сертификаты', 'Certificates')}</div>
                    <div className="cabinet-stat-value">{stats?.certificates || 0}</div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Тесты', 'Quizzes')}</div>
                    <div className="cabinet-stat-value">{stats?.quizAttempts || 0}</div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Задачи', 'Tasks')}</div>
                    <div className="cabinet-stat-value">{stats?.tasksCompleted || 0}/{stats?.totalTasks || 0}</div>
                </div>
            </div>

            <div className="cabinet-card" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                    {t('Прогресс обучения', 'Learning Progress')}
                </h3>
                <div className="cabinet-progress">
                    <div className="cabinet-progress-header">
                        <span className="cabinet-progress-label">{t('Задач выполнено', 'Tasks completed')}</span>
                        <span className="cabinet-progress-value">
                            {stats?.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0}%
                        </span>
                    </div>
                    <div className="cabinet-progress-bar">
                        <div className="cabinet-progress-fill" style={{
                            width: `${stats?.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0}%`,
                        }}></div>
                    </div>
                </div>
            </div>

            <div className="cabinet-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Информация о профиле', 'Profile Information')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Имя', 'Name')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{userProfile?.fullName || '—'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Email', 'Email')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{userProfile?.email || '—'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Роль', 'Role')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                            {userProfile?.role === 'student' ? t('Ученик', 'Student') : userProfile?.role === 'teacher' ? t('Учитель', 'Teacher') : t('Не выбрано', 'Not set')}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Предметы', 'Subjects')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                            {subjectCount > 0 ? userProfile.subjects.join(', ') : t('Не выбрано', 'Not set')}
                        </div>
                    </div>
                </div>
            </div>
        </CabinetLayout>
    );
}
