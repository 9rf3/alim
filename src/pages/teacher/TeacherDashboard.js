import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getTeacherStats, getReviewsByTeacher } from '../../services/firestore';

export default function TeacherDashboard() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;

    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile?.uid) return;

        async function loadData() {
            try {
                setLoading(true);
                const [statsData, reviewsData] = await Promise.all([
                    getTeacherStats(userProfile.uid),
                    getReviewsByTeacher(userProfile.uid),
                ]);
                setStats(statsData);
                setReviews(reviewsData.slice(0, 5));
            } catch (error) {
                console.error('[TeacherDashboard] Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [userProfile?.uid]);

    if (loading) {
        return (
            <TeacherLayout>
                <div className="teacher-loading">
                    <div className="loading-spinner"></div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Dashboard', 'Dashboard')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Бизнес-аналитика и статистика преподавания', 'Business intelligence and teaching statistics')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="teacher-stats-row">
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Всего студентов', 'Total Students')}</div>
                    <div className="teacher-stat-value">{stats?.students || 0}</div>
                    <div className="teacher-stat-change">{t('Зарегистрировано', 'Enrolled')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Курсы', 'Courses')}</div>
                    <div className="teacher-stat-value">{stats?.courses || 0}</div>
                    <div className="teacher-stat-change">{t('Создано', 'Created')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Рейтинг', 'Rating')}</div>
                    <div className="teacher-stat-value">{stats?.rating || '—'}</div>
                    <div className="teacher-stat-change">{t(`${stats?.reviews || 0} отзывов`, `${stats?.reviews || 0} reviews`)}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Видео', 'Videos')}</div>
                    <div className="teacher-stat-value">{stats?.videos || 0}</div>
                    <div className="teacher-stat-change">{t('Загружено', 'Uploaded')}</div>
                </div>
            </div>

            <div className="teacher-grid teacher-grid-2" style={{ marginBottom: '32px' }}>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Мои курсы', 'My Courses')}
                    </h3>
                    {stats?.courses > 0 ? (
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {t('У вас', 'You have')} {stats.courses} {t('курсов', stats.courses === 1 ? 'course' : 'courses')}
                            </p>
                            <div style={{ marginTop: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                                        <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.videos || 0}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('Видео', 'Videos')}</div>
                                    </div>
                                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                                        <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.quizzes || 0}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('Квизы', 'Quizzes')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <p>{t('Создайте свой первый курс', 'Create your first course')}</p>
                        </div>
                    )}
                </div>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Ресурсы', 'Resources')}
                    </h3>
                    {stats?.resources > 0 ? (
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {t('Загружено ресурсов', 'Resources uploaded')}: {stats.resources}
                            </p>
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <p>{t('Загрузите учебные материалы', 'Upload learning materials')}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="teacher-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Последние отзывы', 'Recent Reviews')}
                </h3>
                {reviews.length > 0 ? (
                    <div className="teacher-reviews-list">
                        {reviews.map(review => (
                            <div key={review.id} className="teacher-review-item">
                                <div className="teacher-review-header">
                                    <span className="teacher-review-author">{review.authorName || 'Anonymous'}</span>
                                    <span className="teacher-review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                </div>
                                <p className="teacher-review-text">{review.text}</p>
                                <span className="teacher-review-date">
                                    {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <h3>{t('Нет отзывов', 'No reviews yet')}</h3>
                        <p>{t('Отзывы студентов появятся здесь', 'Student reviews will appear here')}</p>
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
