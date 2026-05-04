import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'userGoals';

const defaultCategories = (role) => {
    if (role === 'teacher') {
        return [
            { id: 'monthly', title: 'Monthly Teaching Goals', icon: '📅' },
            { id: 'yearly', title: 'Yearly Teaching Goals', icon: '🎯' },
            { id: 'courses', title: 'Course Development', icon: '📚' },
        ];
    }
    return [
        { id: 'monthly', title: 'Monthly Learning Goals', icon: '📅' },
        { id: 'yearly', title: 'Yearly Learning Goals', icon: '🎯' },
        { id: 'skills', title: 'Skills to Develop', icon: '💡' },
    ];
};

export default function GoalsPlanner() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const [goals, setGoals] = useState({});

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setGoals(JSON.parse(stored));
        } else {
            const defaults = {};
            defaultCategories(userProfile?.role).forEach(cat => {
                defaults[cat.id] = [];
            });
            setGoals(defaults);
        }
    }, [userProfile?.role]);

    useEffect(() => {
        if (Object.keys(goals).length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
        }
    }, [goals]);

    const categories = defaultCategories(userProfile?.role);

    const addGoal = (categoryId, text) => {
        if (!text.trim()) return;
        setGoals(prev => ({
            ...prev,
            [categoryId]: [
                ...(prev[categoryId] || []),
                { id: Date.now(), text: text.trim(), completed: false, createdAt: new Date().toISOString() }
            ]
        }));
    };

    const toggleGoal = (categoryId, goalId) => {
        setGoals(prev => ({
            ...prev,
            [categoryId]: (prev[categoryId] || []).map(g =>
                g.id === goalId ? { ...g, completed: !g.completed } : g
            )
        }));
    };

    const deleteGoal = (categoryId, goalId) => {
        setGoals(prev => ({
            ...prev,
            [categoryId]: (prev[categoryId] || []).filter(g => g.id !== goalId)
        }));
    };

    const getProgress = (categoryId) => {
        const items = goals[categoryId] || [];
        if (items.length === 0) return 0;
        return Math.round((items.filter(g => g.completed).length / items.length) * 100);
    };

    const getTotalProgress = () => {
        let total = 0;
        let count = 0;
        categories.forEach(cat => {
            const items = goals[cat.id] || [];
            total += items.filter(g => g.completed).length;
            count += items.length;
        });
        return count === 0 ? 0 : Math.round((total / count) * 100);
    };

    const t = (ru, en) => language === 'ru' ? ru : en;

    return (
        <div>
            <div className="profile-section">
                <div className="profile-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    {t('Мой образовательный путь', 'My Educational Roadmap')}
                </div>
                <div className="profile-section-subtitle">
                    {t('Отслеживайте свои цели и прогресс', 'Track your goals and progress')}
                    {getTotalProgress() > 0 && ` — ${getTotalProgress()}% ${t('выполнено', 'completed')}`}
                </div>

                <div className="goals-container">
                    {categories.map(category => {
                        const items = goals[category.id] || [];
                        const progress = getProgress(category.id);
                        return (
                            <GoalCategory
                                key={category.id}
                                category={category}
                                items={items}
                                progress={progress}
                                onAdd={(text) => addGoal(category.id, text)}
                                onToggle={(goalId) => toggleGoal(category.id, goalId)}
                                onDelete={(goalId) => deleteGoal(category.id, goalId)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function GoalCategory({ category, items, progress, onAdd, onToggle, onDelete }) {
    const [newText, setNewText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(newText);
        setNewText('');
    };

    return (
        <div className="goals-category">
            <div className="goals-category-header">
                <div className="goals-category-title">
                    <span className="icon">{category.icon}</span>
                    {category.title}
                </div>
                <div className="goals-progress">
                    <div className="goals-progress-bar">
                        <div className="goals-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span>{progress}%</span>
                </div>
            </div>

            <div className="goals-list">
                {items.map(goal => (
                    <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                        <button
                            className={`goal-checkbox ${goal.completed ? 'checked' : ''}`}
                            onClick={() => onToggle(goal.id)}
                        >
                            {goal.completed && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            )}
                        </button>
                        <span className="goal-text">{goal.text}</span>
                        <button className="goal-delete" onClick={() => onDelete(goal.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <form className="add-goal-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="add-goal-input"
                    placeholder="Add a new goal..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                />
                <button type="submit" className="add-goal-btn">
                    + Add
                </button>
            </form>
        </div>
    );
}
