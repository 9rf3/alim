import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getTeacherStats, getReviewsByTeacher } from '../../services/firestore';

export default function TeacherStudents() {
    const { userProfile } = useAuth();
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('enrolled');

    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const [teacherStats, teacherReviews] = await Promise.all([
                    getTeacherStats(userProfile.uid),
                    getReviewsByTeacher(userProfile.uid),
                ]);
                if (!isMounted) return;
                setStats(teacherStats);
                setReviews(teacherReviews);
            } catch (err) {
                console.error('[TeacherStudents] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки данных', 'Error loading data'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid]);

    const tabs = [
        { id: 'enrolled', label: t('Зачисленные', 'Enrolled') },
        { id: 'followers', label: t('Подписчики', 'Followers') },
        { id: 'buyers', label: t('Покупатели', 'Buyers') },
        { id: 'questions', label: t('Вопросы', 'Questions') },
        { id: 'reviews', label: t('Отзывы', 'Reviews') },
    ];

    if (loading) {
        return (
            <TeacherLayout>
                <div className="teacher-header">
                    <h1>{t('Управление учениками', 'Student Management')}</h1>
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
                        <h1>{t('Управление учениками', 'Student Management')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Управляйте студентами, подписчиками и покупателями', 'Manage students, followers, and buyers')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="teacher-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}

            <div className="teacher-stats-row" style={{ marginBottom: '24px' }}>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Ученики', 'Students')}</div>
                    <div className="teacher-stat-value">{stats?.students || 0}</div>
                    <div className="teacher-stat-change">{t('Всего', 'Total')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Курсы', 'Courses')}</div>
                    <div className="teacher-stat-value">{stats?.courses || 0}</div>
                    <div className="teacher-stat-change">{t('Активных', 'Active')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Отзывы', 'Reviews')}</div>
                    <div className="teacher-stat-value">{stats?.reviews || 0}</div>
                    <div className="teacher-stat-change">{t('Получено', 'Received')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Рейтинг', 'Rating')}</div>
                    <div className="teacher-stat-value">{stats?.rating || '—'}</div>
                    <div className="teacher-stat-change">{t('Средний', 'Average')}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 16px',
                            background: activeTab === tab.id ? 'linear-gradient(135deg, var(--accent-secondary), #EF4444)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'enrolled' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Зачисленные студенты', 'Enrolled Students')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <h3>{t('Нет зачисленных студентов', 'No enrolled students')}</h3>
                        <p>{t('Студенты, записанные на ваши курсы, появятся здесь', 'Students enrolled in your courses will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'followers' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Подписчики', 'Followers')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        <h3>{t('Нет подписчиков', 'No followers')}</h3>
                        <p>{t('Ваши подписчики появятся здесь', 'Your followers will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'buyers' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Покупатели', 'Buyers')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <h3>{t('Нет покупателей', 'No buyers')}</h3>
                        <p>{t('Покупатели ваших курсов и ресурсов появятся здесь', 'Buyers of your courses and resources will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Вопросы студентов', 'Student Questions')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <h3>{t('Нет вопросов', 'No questions')}</h3>
                        <p>{t('Вопросы от студентов появятся здесь', 'Questions from students will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Отзывы учеников', 'Student Reviews')}
                    </h3>
                    {reviews.length === 0 ? (
                        <div className="teacher-empty">
                            <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <h3>{t('Нет отзывов', 'No reviews')}</h3>
                            <p>{t('Отзывы от учеников появятся здесь', 'Reviews from students will appear here')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {reviews.map((review) => (
                                <div key={review.id} style={{
                                    padding: '16px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                            {review.studentName || t('Аноним', 'Anonymous')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= review.rating ? '#F59E0B' : 'var(--text-secondary)'} stroke="none">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </TeacherLayout>
    );
}
