import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherAnalytics() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;

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

            <div className="teacher-grid teacher-grid-2" style={{ marginBottom: '32px' }}>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Производительность курсов', 'Course Performance')}
                    </h3>
                    <div className="teacher-chart">
                        {t('График производительности', 'Performance chart')}
                    </div>
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
                    <div className="teacher-stat-label">{t('Просмотры страниц', 'Page Views')}</div>
                    <div className="teacher-stat-value">0</div>
                    <div className="teacher-stat-change">{t('За 30 дней', 'Last 30 days')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Конверсия', 'Conversion')}</div>
                    <div className="teacher-stat-value">0%</div>
                    <div className="teacher-stat-change">{t('Посетители → Покупатели', 'Visitors → Buyers')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Среднее время', 'Avg. Time')}</div>
                    <div className="teacher-stat-value">0м</div>
                    <div className="teacher-stat-change">{t('На платформе', 'On platform')}</div>
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
