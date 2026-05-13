import { useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/dashboard/widgets.css';

const defaultAchievements = [
    { id: 'first', icon: '🚀', ru: 'Первый шаг', en: 'First Step', descRu: 'Завершите первый урок', descEn: 'Complete your first lesson' },
    { id: 'streak', icon: '🔥', ru: 'Огонь', en: 'On Fire', descRu: '3 дня подряд', descEn: '3 day streak' },
    { id: 'scholar', icon: '📚', ru: 'Учёный', en: 'Scholar', descRu: '10 завершённых уроков', descEn: '10 completed lessons' },
    { id: 'quiz', icon: '🧠', ru: 'Знаток', en: 'Quiz Master', descRu: 'Пройдите 5 тестов', descEn: 'Complete 5 quizzes' },
    { id: 'speed', icon: '⚡', ru: 'Скорость', en: 'Speedster', descRu: 'Урок за 5 минут', descEn: 'Lesson under 5 min' },
    { id: 'helper', icon: '🤝', ru: 'Помощник', en: 'Helper', descRu: 'Помогите другим', descEn: 'Help others' },
];

export default function AchievementCard({ achievements }) {
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const list = achievements && achievements.length > 0 ? achievements : defaultAchievements;

    return (
        <div className="dash-widget dash-widget-achievements">
            <div className="dash-widget-header">
                <div className="dash-widget-title-row">
                    <svg className="dash-widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="7"/>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                    </svg>
                    <h3 className="dash-widget-title">{t('Достижения', 'Achievements')}</h3>
                </div>
                <span className="dash-widget-count">{list.filter(a => a.unlocked).length}/{list.length}</span>
            </div>
            <div className="dash-achievement-grid">
                {list.slice(0, 6).map((ach, i) => (
                    <div
                        key={ach.id || i}
                        className={`dash-achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`}
                        title={language === 'ru' ? ach.descRu : ach.descEn}
                    >
                        <div className="dash-achievement-icon">{ach.icon}</div>
                        <span className="dash-achievement-name">
                            {language === 'ru' ? ach.ru : ach.en}
                        </span>
                        {ach.unlocked && <div className="dash-achievement-glow"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
