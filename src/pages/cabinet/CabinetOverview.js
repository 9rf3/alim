import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { useNavigate } from 'react-router-dom';
import { getStudentStats } from '../../services/firestore';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import SubjectCard from '../../components/dashboard/SubjectCard';
import TasksWidget from '../../components/dashboard/TasksWidget';
import AIWidget from '../../components/dashboard/AIWidget';
import ActivityChart from '../../components/dashboard/ActivityChart';
import AchievementCard from '../../components/dashboard/AchievementCard';
import QuickActions from '../../components/dashboard/QuickActions';
import '../../styles/dashboard/dashboard.css';
import '../../styles/dashboard/animations.css';
import '../../styles/dashboard/responsive.css';

export default function CabinetOverview() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const navigate = useNavigate();
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
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки', 'Error loading data'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const progressPercent = stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0;
    const studyHours = Math.round((stats.videosWatched * 0.5) * 10) / 10;

    const statCards = [
        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, label: t('Курсы', 'Courses'), value: loading ? '...' : stats.courses, color: 'blue' },
        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: t('Часы', 'Hours'), value: loading ? '...' : studyHours, color: 'purple' },
        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, label: t('Сертификаты', 'Certificates'), value: loading ? '...' : stats.certificates, color: 'green' },
        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label: t('Прогресс', 'Progress'), value: loading ? '...' : `${progressPercent}%`, color: 'orange' },
        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: t('Тесты', 'Quizzes'), value: loading ? '...' : stats.quizAttempts, color: 'pink' },
        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>, label: t('Заметки', 'Notes'), value: loading ? '...' : stats.notes, color: 'cyan' },
    ];

    return (
        <CabinetLayout>
            <div className="dash-page">
                <DashboardHeader stats={stats} loading={loading} />

                {error && (
                    <div className="dash-error-banner">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        {error}
                    </div>
                )}

                <div className="dash-grid">
                    {statCards.map((card, i) => (
                        <StatCard key={i} {...card} />
                    ))}
                </div>

                {userProfile?.subjects && userProfile.subjects.length > 0 && (
                    <>
                        <div className="dash-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                            {t('Мои предметы', 'My Subjects')}
                            <a className="dash-section-more" href="/cabinet/profile">{t('Управлять', 'Manage')}</a>
                        </div>
                        <div className="dash-subjects-row">
                            {userProfile.subjects.map((subj, i) => (
                                <SubjectCard
                                    key={subj.id || i}
                                    subjectId={typeof subj === 'string' ? subj : subj.id}
                                    progress={subj.progress || Math.floor(Math.random() * 60) + 20}
                                    onClick={() => navigate('/cabinet/laboratory')}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="dash-grid-main">
                    <div className="dash-grid-2">
                        <TasksWidget />
                        <AIWidget />
                    </div>
                    <ActivityChart stats={stats} />
                </div>

                <div className="dash-grid-2">
                    <AchievementCard achievements={[]} />
                    <QuickActions />
                </div>
            </div>
        </CabinetLayout>
    );
}
