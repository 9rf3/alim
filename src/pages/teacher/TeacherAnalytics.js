import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getTeacherStats, getCoursesByTeacher, getVideosByTeacher, getQuizzesByTeacher } from '../../services/firestore';

export default function TeacherAnalytics() {
    const { userProfile } = useAuth();
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [videos, setVideos] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const [teacherStats, teacherCourses, teacherVideos, teacherQuizzes] = await Promise.all([
                    getTeacherStats(userProfile.uid),
                    getCoursesByTeacher(userProfile.uid),
                    getVideosByTeacher(userProfile.uid),
                    getQuizzesByTeacher(userProfile.uid),
                ]);
                if (!isMounted) return;
                setStats(teacherStats);
                setCourses(teacherCourses);
                setVideos(teacherVideos);
                setQuizzes(teacherQuizzes);
            } catch (err) {
                console.error('[TeacherAnalytics] Error:', err);
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
                    <h1>{t('Аналитика', 'Analytics')}</h1>
                </div>
                <div className="teacher-empty">
                    <p>{t('Загрузка...', 'Loading...')}</p>
                </div>
            </TeacherLayout>
        );
    }

    const totalContent = (stats?.courses || 0) + (stats?.videos || 0) + (stats?.quizzes || 0) + (stats?.resources || 0);
    const conversionRate = stats?.students > 0 && stats?.courses > 0
        ? Math.round((stats.students / (stats.courses * 10)) * 100)
        : 0;

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Аналитика', 'Analytics')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Глубокая аналитика производительности и вовлечённости', 'Deep performance and engagement analytics')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="teacher-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}

            <div className="teacher-grid teacher-grid-2" style={{ marginBottom: '32px' }}>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Производительность курсов', 'Course Performance')}
                    </h3>
                    {courses.length === 0 ? (
                        <div className="teacher-empty" style={{ padding: '20px' }}>
                            <p>{t('Нет данных о курсах', 'No course data')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {courses.slice(0, 5).map((course) => (
                                <div key={course.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '6px',
                                }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{course.title}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {course.studentCount || 0} {t('студентов', 'students')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Вовлечённость студентов', 'Student Engagement')}
                    </h3>
                    <div className="teacher-chart">
                        {t('График вовлечённости', 'Engagement chart')}
                    </div>
                </div>
            </div>

            <div className="teacher-grid teacher-grid-3" style={{ marginBottom: '32px' }}>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Контент', 'Content')}</div>
                    <div className="teacher-stat-value">{totalContent}</div>
                    <div className="teacher-stat-change">{t('Всего элементов', 'Total items')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Конверсия', 'Conversion')}</div>
                    <div className="teacher-stat-value">{conversionRate}%</div>
                    <div className="teacher-stat-change">{t('Посетители → Покупатели', 'Visitors → Buyers')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Рейтинг', 'Rating')}</div>
                    <div className="teacher-stat-value">{stats?.rating || '—'}</div>
                    <div className="teacher-stat-change">{stats?.reviews || 0} {t('отзывов', 'reviews')}</div>
                </div>
            </div>

            <div className="teacher-grid teacher-grid-2" style={{ marginBottom: '32px' }}>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Активность видео', 'Video Activity')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Всего видео', 'Total videos')}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{videos.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Просмотры', 'Views')}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {videos.reduce((sum, v) => sum + (v.views || 0), 0)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Активность квизов', 'Quiz Activity')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Всего квизов', 'Total quizzes')}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{quizzes.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Попыток', 'Attempts')}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {quizzes.reduce((sum, q) => sum + (q.attempts || 0), 0)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Средний балл', 'Avg Score')}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {quizzes.length > 0
                                    ? (quizzes.reduce((sum, q) => sum + (q.avgScore || 0), 0) / quizzes.length).toFixed(1)
                                    : '—'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="teacher-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Тепловая карта активности', 'Activity Heatmap')}
                </h3>
                <div className="teacher-chart" style={{ height: '150px' }}>
                    {t('Тепловая карта появится здесь', 'Activity heatmap will appear here')}
                </div>
            </div>
        </TeacherLayout>
    );
}
