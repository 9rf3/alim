import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTasksByUser, toggleSimpleTask } from '../../services/firestore';
import '../../styles/dashboard/widgets.css';

export default function TasksWidget() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let mounted = true;

        const load = async () => {
            try {
                const data = await getTasksByUser(userProfile.uid);
                if (!mounted) return;
                setTasks(data.slice(0, 5));
            } catch (err) {
                if (!mounted) return;
                setError(err.message);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [userProfile?.uid]);

    const handleToggle = async (taskId) => {
        try {
            await toggleSimpleTask(taskId);
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
            ));
        } catch (err) {
            console.error('[TasksWidget] toggle error:', err);
        }
    };

    return (
        <div className="dash-widget dash-widget-tasks">
            <div className="dash-widget-header">
                <div className="dash-widget-title-row">
                    <svg className="dash-widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <h3 className="dash-widget-title">{t('Задачи на сегодня', "Today's Tasks")}</h3>
                </div>
                <span className="dash-widget-count">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
            </div>
            <div className="dash-widget-body">
                {loading ? (
                    <div className="dash-widget-loader">
                        <div className="dash-spinner"></div>
                    </div>
                ) : error ? (
                    <p className="dash-widget-empty">{t('Ошибка загрузки', 'Error loading')}</p>
                ) : tasks.length === 0 ? (
                    <p className="dash-widget-empty">{t('Нет задач', 'No tasks yet')}</p>
                ) : (
                    <ul className="dash-task-list">
                        {tasks.map(task => (
                            <li key={task.id} className={`dash-task-item ${task.completed ? 'completed' : ''}`}>
                                <button
                                    className={`dash-task-check ${task.completed ? 'checked' : ''}`}
                                    onClick={() => handleToggle(task.id)}
                                >
                                    {task.completed && (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </button>
                                <span className="dash-task-text">{task.title || task.name || 'Untitled'}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
