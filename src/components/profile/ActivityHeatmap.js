import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'userActivity';

function generateSampleActivity() {
    const data = {};
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        const rand = Math.random();
        if (rand > 0.7) {
            data[key] = Math.floor(rand * 5) + 1;
        } else {
            data[key] = 0;
        }
    }
    return data;
}

export default function ActivityHeatmap() {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [activity, setActivity] = useState({});

    useEffect(() => {
        let data = {};
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            data = JSON.parse(stored);
        } else {
            data = generateSampleActivity();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        setActivity(data);
    }, []);

    useEffect(() => {
        if (user) {
            logActivity();
        }
    }, [user]);

    const logActivity = () => {
        const today = new Date().toISOString().split('T')[0];
        setActivity(prev => {
            const updated = { ...prev };
            updated[today] = (updated[today] || 0) + 1;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const heatmapData = useMemo(() => {
        const weeks = [];
        const today = new Date();
        let currentWeek = [];

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            const count = activity[key] || 0;
            currentWeek.push({ date: key, count, day: date.getDay() });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [activity]);

    const stats = useMemo(() => {
        const values = Object.values(activity);
        const total = values.reduce((a, b) => a + b, 0);
        const activeDays = values.filter(v => v > 0).length;
        const maxDay = Math.max(...values, 0);
        let streak = 0;
        let currentStreak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            if (activity[key] > 0) {
                currentStreak++;
                streak = Math.max(streak, currentStreak);
            } else {
                if (i === 0) continue;
                currentStreak = 0;
            }
        }

        return { total, activeDays, maxDay, streak };
    }, [activity]);

    const getLevel = (count) => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const t = (ru, en) => language === 'ru' ? ru : en;

    return (
        <div className="profile-section">
            <div className="profile-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {t('Активность', 'Activity')}
            </div>
            <div className="profile-section-subtitle">
                {t('Ваша активность за последний год', 'Your activity over the past year')}
            </div>

            <div className="heatmap-container">
                <div className="heatmap-header">
                    <div></div>
                    <div className="heatmap-legend">
                        <span>{t('Меньше', 'Less')}</span>
                        <div className="heatmap-legend-cell" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="heatmap-legend-cell" style={{ background: 'rgba(16, 185, 129, 0.2)' }} />
                        <div className="heatmap-legend-cell" style={{ background: 'rgba(16, 185, 129, 0.4)' }} />
                        <div className="heatmap-legend-cell" style={{ background: 'rgba(16, 185, 129, 0.6)' }} />
                        <div className="heatmap-legend-cell" style={{ background: 'rgba(16, 185, 129, 0.85)' }} />
                        <span>{t('Больше', 'More')}</span>
                    </div>
                </div>

                <div className="heatmap-grid">
                    {heatmapData.map((week, wi) =>
                        week.map((day, di) => (
                            <div
                                key={`${wi}-${di}`}
                                className={`heatmap-cell level-${getLevel(day.count)}`}
                            >
                                <div className="tooltip">
                                    {day.count} {t('активностей', 'activities')} — {day.date}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="heatmap-stats">
                <div className="heatmap-stat">
                    <div className="heatmap-stat-value">{stats.total}</div>
                    <div className="heatmap-stat-label">{t('Всего активностей', 'Total Activities')}</div>
                </div>
                <div className="heatmap-stat">
                    <div className="heatmap-stat-value">{stats.activeDays}</div>
                    <div className="heatmap-stat-label">{t('Активных дней', 'Active Days')}</div>
                </div>
                <div className="heatmap-stat">
                    <div className="heatmap-stat-value">{stats.streak}</div>
                    <div className="heatmap-stat-label">{t('Макс. серия (дни)', 'Best Streak (days)')}</div>
                </div>
                <div className="heatmap-stat">
                    <div className="heatmap-stat-value">{stats.maxDay}</div>
                    <div className="heatmap-stat-label">{t('Лучший день', 'Best Day')}</div>
                </div>
            </div>
        </div>
    );
}
