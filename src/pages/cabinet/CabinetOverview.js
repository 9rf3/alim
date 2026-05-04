import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { Link } from 'react-router-dom';
import { getStudentStats } from '../../services/firestore';

function getIcon(type, className) {
    const icons = {
        flask: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/><path d="M6 8H18"/><path d="M7 3H17"/></svg>,
        creditCard: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
        book: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
        calendar: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
        atom: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 3c4.97 0 9 2.69 9 6s-4.03 6-9 6-9-2.69-9-6 4.03-6 9-6z"/><path d="M12 3c-4.97 0-9 2.69-9 6s4.03 6 9 6 9-2.69 9-6-4.03-6-9-6z"/></svg>,
        edit: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
        award: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
        chart: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
        shopping: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    };
    return icons[type] || null;
}

export default function CabinetOverview() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    const [stats, setStats] = useState({ courses: 0, videosWatched: 0, certificates: 0, notes: 0, tasksCompleted: 0, totalTasks: 0, quizAttempts: 0, avgScore: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const data = await getStudentStats(userProfile.uid);
                if (!isMounted) return;
                setStats(data);
            } catch (err) {
                console.error('[CabinetOverview] Error loading stats:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки', 'Error loading data'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const subjectCount = userProfile?.subjects?.length || 0;
    const progressPercent = stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0;
    const studyHours = Math.round((stats.videosWatched * 0.5) * 10) / 10;

    const featureCards = [
        { icon: 'flask', color: 'blue', title: t('Лаборатория', 'Laboratory'), description: t('Создавайте проекты, пишите код и экспериментируйте', 'Create projects, write code, and experiment'), path: '/cabinet/laboratory', stat: loading ? '...' : `${stats.videosWatched} ${t('видео', 'videos')}` },
        { icon: 'book', color: 'purple', title: t('Библиотека', 'Library'), description: t('Учебники, заметки и образовательные ресурсы', 'Textbooks, notes, and educational resources'), path: '/cabinet/library', stat: loading ? '...' : `${stats.notes} ${t('заметок', 'notes')}` },
        { icon: 'calendar', color: 'green', title: t('Учебный план', 'Study Plan'), description: t('Планируйте обучение и отслеживайте прогресс', 'Plan your learning and track progress'), path: '/cabinet/study-plan', stat: loading ? '...' : `${stats.tasksCompleted}/${stats.totalTasks} ${t('задач', 'tasks')}` },
        { icon: 'atom', color: 'orange', title: t('Симуляции', 'Simulations'), description: t('Интерактивные 3D модели по физике, химии и математике', 'Interactive 3D models for physics, chemistry, and math'), path: '/cabinet/simulations', stat: '12 симуляций' },
        { icon: 'edit', color: 'red', title: t('Редактор', 'Editor'), description: t('Видеоуроки, тесты, заметки и учебные материалы', 'Video lessons, tests, notes, and study materials'), path: '/cabinet/editor', stat: loading ? '...' : `${stats.quizAttempts} ${t('тестов', 'quizzes')}` },
        { icon: 'award', color: 'blue', title: t('Сертификаты', 'Certificates'), description: t('Получайте сертификаты за завершение курсов', 'Earn certificates for course completion'), path: '/cabinet/certificates', stat: loading ? '...' : `${stats.certificates} ${t('сертификатов', 'certificates')}` },
        { icon: 'chart', color: 'purple', title: t('Мои данные', 'My Data'), description: t('Статистика, прогресс и аналитика обучения', 'Statistics, progress, and learning analytics'), path: '/cabinet/data', stat: t('Обновлено', 'Updated') },
        { icon: 'shopping', color: 'green', title: t('Торговля', 'Trading'), description: t('Покупайте и продавайте проекты и материалы', 'Buy and sell projects and materials'), path: '/cabinet/marketplace', stat: t('0 предложений', '0 listings') },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Добро пожаловать', 'Welcome')}, {userProfile?.fullName || 'User'}!</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Все инструменты для эффективного обучения и развития', 'All tools for effective learning and development')}
                        </p>
                    </div>
                    <div className="cabinet-header-actions">
                        <Link to="/profile" className="cabinet-btn secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {t('Профиль', 'Profile')}
                        </Link>
                    </div>
                </div>
            </div>

            {error && (
                <div className="cabinet-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}

            <div className="cabinet-stats-row">
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Предметы', 'Subjects')}</div>
                    <div className="cabinet-stat-value">{loading ? '...' : subjectCount}</div>
                    <div className="cabinet-stat-change">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                        {t('Начните обучение', 'Start learning')}
                    </div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Часы обучения', 'Study Hours')}</div>
                    <div className="cabinet-stat-value">{loading ? '...' : studyHours}</div>
                    <div className="cabinet-stat-change">
                        {t('За всё время', 'All time')}
                    </div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Сертификаты', 'Certificates')}</div>
                    <div className="cabinet-stat-value">{loading ? '...' : stats.certificates}</div>
                    <div className="cabinet-stat-change">
                        {t('Получено', 'Earned')}
                    </div>
                </div>
                <div className="cabinet-stat-card">
                    <div className="cabinet-stat-label">{t('Прогресс', 'Progress')}</div>
                    <div className="cabinet-stat-value">{loading ? '...' : `${progressPercent}%`}</div>
                    <div className="cabinet-stat-change">
                        {t('Общий прогресс', 'Overall progress')}
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                {t('Все разделы', 'All Sections')}
            </h2>

            <div className="cabinet-grid cabinet-grid-4">
                {featureCards.map((card, idx) => (
                    <Link to={card.path} key={idx} className="cabinet-card clickable">
                        <div className="cabinet-card-header">
                            <div className={`cabinet-card-icon ${card.color}`}>
                                {getIcon(card.icon, 'cabinet-card-icon')}
                            </div>
                        </div>
                        <div className="cabinet-card-title">{card.title}</div>
                        <div className="cabinet-card-description">{card.description}</div>
                        <div className="cabinet-card-footer">
                            <div className="cabinet-card-stat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {card.stat}
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-primary)' }}>
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </CabinetLayout>
    );
}
