import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherDashboard() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;

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
                    <div className="teacher-stat-value">0</div>
                    <div className="teacher-stat-change">{t('Зарегистрировано', 'Enrolled')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Завершение курсов', 'Course Completion')}</div>
                    <div className="teacher-stat-value">0%</div>
                    <div className="teacher-stat-change">{t('Средний показатель', 'Average rate')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Рейтинг', 'Rating')}</div>
                    <div className="teacher-stat-value">—</div>
                    <div className="teacher-stat-change">{t('0 отзывов', '0 reviews')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Вовлечённость', 'Engagement')}</div>
                    <div className="teacher-stat-value">0%</div>
                    <div className="teacher-stat-change">{t('Активность', 'Activity')}</div>
                </div>
            </div>

            <div className="teacher-grid teacher-grid-2" style={{ marginBottom: '32px' }}>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Рост студентов', 'Student Growth')}
                    </h3>
                    <div className="teacher-chart">
                        {t('График роста студентов', 'Student growth chart')}
                    </div>
                </div>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Динамика доходов', 'Revenue Trends')}
                    </h3>
                    <div className="teacher-chart">
                        {t('График доходов', 'Revenue chart')}
                    </div>
                </div>
            </div>

            <div className="teacher-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Последние отзывы', 'Recent Reviews')}
                </h3>
                <div className="teacher-empty">
                    <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <h3>{t('Нет отзывов', 'No reviews yet')}</h3>
                    <p>{t('Отзывы студентов появятся здесь', 'Student reviews will appear here')}</p>
                </div>
            </div>
        </TeacherLayout>
    );
}
