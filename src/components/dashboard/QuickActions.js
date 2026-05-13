import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/dashboard/widgets.css';

const actions = [
    { id: 'lab', path: '/cabinet/laboratory', icon: '🧪', ru: 'Лаборатория', en: 'Laboratory' },
    { id: 'library', path: '/cabinet/library', icon: '📖', ru: 'Библиотека', en: 'Library' },
    { id: 'study', path: '/cabinet/study-plan', icon: '📅', ru: 'План', en: 'Study Plan' },
    { id: 'sims', path: '/cabinet/simulations', icon: '🔬', ru: 'Симуляции', en: 'Simulations' },
    { id: 'profile', path: '/cabinet/profile', icon: '👤', ru: 'Профиль', en: 'Profile' },
    { id: 'data', path: '/cabinet/data', icon: '📊', ru: 'Статистика', en: 'Stats' },
];

export default function QuickActions() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    return (
        <div className="dash-widget dash-widget-actions">
            <div className="dash-widget-header">
                <div className="dash-widget-title-row">
                    <svg className="dash-widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <h3 className="dash-widget-title">{t('Быстрый доступ', 'Quick Actions')}</h3>
                </div>
            </div>
            <div className="dash-actions-grid">
                {actions.map(action => (
                    <button
                        key={action.id}
                        className="dash-action-btn"
                        onClick={() => navigate(action.path)}
                    >
                        <span className="dash-action-icon">{action.icon}</span>
                        <span className="dash-action-label">{t(action.ru, action.en)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
