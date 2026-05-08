import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentStats, getTeacherStats } from '../../services/firestore';

export default function ActivityHeatmap() {
    const { language } = useLanguage();
    const { userProfile, firebaseUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const uid = userProfile?.uid || firebaseUser?.uid;

    useEffect(() => {
        if (!uid) return;
        setLoading(true);
        const fn = userProfile?.role === 'teacher' ? getTeacherStats : getStudentStats;
        fn(uid).then(data => {
            setStats(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [uid, userProfile?.role]);

    const t = (ru, en) => language === 'ru' ? ru : en;

    if (loading) {
        return (
            <div className="profile-section">
                <div className="profile-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {t('Активность', 'Activity')}
                </div>
                <div className="profile-section-subtitle">{t('Загрузка...', 'Loading...')}</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="profile-section">
                <div className="profile-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {t('Активность', 'Activity')}
                </div>
                <div className="profile-section-subtitle">
                    {t('Нет данных об активности', 'No activity recorded')}
                </div>
            </div>
        );
    }

    const isTeacher = userProfile?.role === 'teacher';

    const activityItems = isTeacher
        ? [
            { label: t('Курсы', 'Courses'), value: stats.courses, icon: '📚' },
            { label: t('Видео', 'Videos'), value: stats.videos, icon: '🎬' },
            { label: t('Тесты', 'Quizzes'), value: stats.quizzes, icon: '📝' },
            { label: t('Ресурсы', 'Resources'), value: stats.resources, icon: '📎' },
            { label: t('Студенты', 'Students'), value: stats.students, icon: '👨‍🎓' },
            { label: t('Отзывы', 'Reviews'), value: stats.reviews, icon: '⭐' },
        ]
        : [
            { label: t('Тесты пройдено', 'Quizzes Done'), value: stats.quizAttempts, icon: '📝' },
            { label: t('Средний балл', 'Avg Score'), value: stats.avgScore ? `${stats.avgScore}%` : '—', icon: '🎯' },
            { label: t('Сертификаты', 'Certificates'), value: stats.certificates, icon: '🏆' },
            { label: t('Заметки', 'Notes'), value: stats.notes, icon: '📓' },
            { label: t('Задач выполнено', 'Tasks Done'), value: stats.tasksCompleted, icon: '✅' },
            { label: t('Видео просмотрено', 'Videos Watched'), value: stats.videosWatched, icon: '🎬' },
        ];

    const hasActivity = activityItems.some(item =>
        typeof item.value === 'number' ? item.value > 0 : item.value !== '—'
    );

    return (
        <div className="profile-section">
            <div className="profile-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {t('Активность', 'Activity')}
            </div>
            <div className="profile-section-subtitle">
                {t('Статистика вашей активности', 'Your activity statistics')}
            </div>

            {!hasActivity ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>📊</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {t('Нет активности', 'No activity yet')}
                    </p>
                </div>
            ) : (
                <div className="heatmap-stats">
                    {activityItems.map((item, i) => (
                        <div key={i} className="heatmap-stat">
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</div>
                            <div className="heatmap-stat-value">{item.value}</div>
                            <div className="heatmap-stat-label">{item.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}