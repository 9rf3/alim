import { useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/dashboard/widgets.css';

export default function ActivityChart({ stats }) {
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const [view, setView] = useState('week');

    const days = t(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    const data = [40, 65, 80, 45, 90, 55, 70];

    const maxVal = Math.max(...data, 1);

    return (
        <div className="dash-widget dash-widget-activity">
            <div className="dash-widget-header">
                <div className="dash-widget-title-row">
                    <svg className="dash-widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <h3 className="dash-widget-title">{t('Активность', 'Activity')}</h3>
                </div>
                <div className="dash-chart-tabs">
                    <button className={`dash-chart-tab ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>
                        {t('Нед', 'Wk')}
                    </button>
                    <button className={`dash-chart-tab ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>
                        {t('Меc', 'Mo')}
                    </button>
                </div>
            </div>
            <div className="dash-chart-container">
                <div className="dash-chart-bars">
                    {data.map((val, i) => (
                        <div key={i} className="dash-chart-col">
                            <div className="dash-chart-bar-wrap">
                                <div
                                    className="dash-chart-bar"
                                    style={{ height: `${(val / maxVal) * 100}%` }}
                                >
                                    <div className="dash-chart-bar-glow"></div>
                                </div>
                            </div>
                            <span className="dash-chart-label">{days[i]}</span>
                        </div>
                    ))}
                </div>
                <div className="dash-chart-summary">
                    <div className="dash-chart-stat">
                        <span className="dash-chart-stat-label">{t('За неделю', 'This Week')}</span>
                        <span className="dash-chart-stat-value">{stats?.videosWatched || 0} {t('действий', 'actions')}</span>
                    </div>
                    <div className="dash-chart-stat">
                        <span className="dash-chart-stat-label">{t('Средний балл', 'Avg Score')}</span>
                        <span className="dash-chart-stat-value">{stats?.avgScore || 0}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
