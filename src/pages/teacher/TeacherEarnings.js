import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherEarnings() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Доходы', 'Earnings')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Отслеживайте заработок и транзакции', 'Track earnings and transactions')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="teacher-stats-row">
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Общий доход', 'Total Earnings')}</div>
                    <div className="teacher-stat-value">$0</div>
                    <div className="teacher-stat-change">{t('За всё время', 'All time')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Этот месяц', 'This Month')}</div>
                    <div className="teacher-stat-value">$0</div>
                    <div className="teacher-stat-change">{t('Доходы за месяц', 'Monthly revenue')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Доступно', 'Available')}</div>
                    <div className="teacher-stat-value">$0</div>
                    <div className="teacher-stat-change">{t('Для вывода', 'For withdrawal')}</div>
                </div>
                <div className="teacher-stat-card">
                    <div className="teacher-stat-label">{t('Транзакции', 'Transactions')}</div>
                    <div className="teacher-stat-value">0</div>
                    <div className="teacher-stat-change">{t('Всего', 'Total')}</div>
                </div>
            </div>

            <div className="teacher-grid teacher-grid-2" style={{ marginBottom: '32px' }}>
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Источники дохода', 'Revenue Sources')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: t('Продажи курсов', 'Course Sales'), amount: '$0', percent: 0, color: 'purple' },
                            { label: t('Продажа ресурсов', 'Resource Sales'), amount: '$0', percent: 0, color: 'blue' },
                            { label: t('Проекты', 'Projects'), amount: '$0', percent: 0, color: 'green' },
                        ].map((source, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{source.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{source.amount}</span>
                                </div>
                                <div className="teacher-progress-bar">
                                    <div className="teacher-progress-fill" style={{ width: `${source.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Динамика доходов', 'Revenue Trends')}
                    </h3>
                    <div className="teacher-chart">
                        {t('График доходов появится здесь', 'Revenue chart will appear here')}
                    </div>
                </div>
            </div>

            <div className="teacher-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('История транзакций', 'Transaction History')}
                </h3>
                <div className="teacher-empty">
                    <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <h3>{t('Нет транзакций', 'No transactions')}</h3>
                    <p>{t('Ваши транзакции появятся здесь', 'Your transactions will appear here')}</p>
                </div>
            </div>
        </TeacherLayout>
    );
}
