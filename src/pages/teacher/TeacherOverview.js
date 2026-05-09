import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { Link } from 'react-router-dom';
import { getTeacherStats } from '../../services/firestore';

function getIcon(type, className) {
    const icons = {
        video: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
        clipboard: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
        chart: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
        dollar: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        folder: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
        flask: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/><path d="M6 8H18"/><path d="M7 3H17"/></svg>,
        users: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
        wallet: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
        analytics: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    };
    return icons[type] || null;
}

export default function TeacherOverview() {
    const { userProfile } = useAuth();
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadStats = async () => {
            try {
                const teacherStats = await getTeacherStats(userProfile.uid);
                if (!isMounted) return;
                setStats(teacherStats);
            } catch (err) {
                console.error('[TeacherOverview] Error loading stats:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadStats();
        return () => { isMounted = false; };
    }, [userProfile?.uid]);

    const featureCards = [
        {
            icon: 'video',
            color: 'red',
            title: t('Видео система', 'Video System'),
            description: t('Загружайте уроки, создавайте курсы и плейлисты', 'Upload lessons, create courses and playlists'),
            path: '/teacher/video',
            stat: stats ? `${stats.videos} ${t('видео', 'videos')}` : t('0 видео', '0 videos'),
        },
        {
            icon: 'clipboard',
            color: 'orange',
            title: t('Инструменты квизов', 'Quiz Tools'),
            description: t('Создавайте тесты с автопроверкой и AI-помощником', 'Create quizzes with auto-grading and AI helper'),
            path: '/teacher/quiz',
            stat: stats ? `${stats.quizzes} ${t('квизов', 'quizzes')}` : t('0 квизов', '0 quizzes'),
        },
        {
            icon: 'chart',
            color: 'blue',
            title: t('Dashboard', 'Dashboard'),
            description: t('Бизнес-аналитика и статистика преподавания', 'Business intelligence and teaching statistics'),
            path: '/teacher/dashboard',
            stat: t('Обновлено', 'Updated'),
        },
        {
            icon: 'dollar',
            color: 'green',
            title: t('Управление ценами', 'Pricing Control'),
            description: t('Устанавливайте цены, скидки и акции', 'Set prices, discounts, and promotions'),
            path: '/teacher/pricing',
            stat: stats ? `${stats.courses} ${t('курсов', 'courses')}` : t('0 курсов', '0 courses'),
        },
        {
            icon: 'folder',
            color: 'purple',
            title: t('Магазин ресурсов', 'Resource Store'),
            description: t('Продавайте PDF, рабочие тетради и материалы', 'Sell PDFs, workbooks, and materials'),
            path: '/teacher/resources',
            stat: stats ? `${stats.resources} ${t('ресурсов', 'resources')}` : t('0 ресурсов', '0 resources'),
        },
        {
            icon: 'flask',
            color: 'blue',
            title: t('Лаборатория', 'Laboratory'),
            description: t('Принимайте заказы и создавайте проекты', 'Accept orders and create projects'),
            path: '/teacher/laboratory',
            stat: t('0 заказов', '0 orders'),
        },
        {
            icon: 'users',
            color: 'green',
            title: t('Ученики', 'Students'),
            description: t('Управляйте студентами, подписчиками и покупателями', 'Manage students, followers, and buyers'),
            path: '/teacher/students',
            stat: stats ? `${stats.students} ${t('учеников', 'students')}` : t('0 учеников', '0 students'),
        },
        {
            icon: 'wallet',
            color: 'orange',
            title: t('Доходы', 'Earnings'),
            description: t('Отслеживайте заработок и транзакции', 'Track earnings and transactions'),
            path: '/teacher/earnings',
            stat: stats ? `$${stats.courses * 29.99 || 0}` : '$0',
        },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Кабинет учителя', 'Teacher Cabinet')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Мощные инструменты для преподавания, управления и монетизации', 'Powerful tools for teaching, management, and monetization')}
                        </p>
                    </div>
                    <div className="teacher-header-actions">
                        <Link to="/cabinet/profile" className="teacher-btn secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {t('Профиль', 'Profile')}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="teacher-stats-row">
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Ученики', 'Students')}</div>
                    <div className="teacher-stat-value">{loading ? '...' : stats?.students || 0}</div>
                    <div className="teacher-stat-change">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                        {t('Начните преподавать', 'Start teaching')}
                    </div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Курсы', 'Courses')}</div>
                    <div className="teacher-stat-value">{loading ? '...' : stats?.courses || 0}</div>
                    <div className="teacher-stat-change">
                        {t('Создано', 'Created')}
                    </div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Доход', 'Revenue')}</div>
                    <div className="teacher-stat-value">${loading ? '...' : (stats?.courses * 29.99 || 0)}</div>
                    <div className="teacher-stat-change">
                        {t('За всё время', 'All time')}
                    </div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Рейтинг', 'Rating')}</div>
                    <div className="teacher-stat-value">{loading ? '...' : (stats?.rating || '—')}</div>
                    <div className="teacher-stat-change">
                        {stats?.reviews > 0 ? `${stats.reviews} ${t('отзывов', 'reviews')}` : t('Ожидает отзывов', 'Awaiting reviews')}
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                {t('Все модули', 'All Modules')}
            </h2>

            <div className="teacher-grid teacher-grid-4">
                {featureCards.map((card, idx) => (
                    <Link to={card.path} key={idx} className="teacher-card clickable">
                        <div className="teacher-card-header">
                            <div className={`teacher-card-icon ${card.color}`}>
                                {getIcon(card.icon, 'teacher-card-icon')}
                            </div>
                        </div>
                        <div className="teacher-card-title">{card.title}</div>
                        <div className="teacher-card-description">{card.description}</div>
                        <div className="teacher-card-footer">
                            <div className="teacher-card-stat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {card.stat}
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-secondary)' }}>
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </TeacherLayout>
    );
}
