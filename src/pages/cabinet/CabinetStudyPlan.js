import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import {
    createStudyPlan,
    getStudyPlansByUser,
    createTask,
    toggleTaskComplete,
    deleteTask,
    createSimpleTask,
    toggleSimpleTask,
    getTasksByUser,
} from '../../services/firestore';

export default function CabinetStudyPlan() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const [planType, setPlanType] = useState('simple');

    const [plans, setPlans] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // New plan form
    const [showNewPlan, setShowNewPlan] = useState(false);
    const [newPlanTitle, setNewPlanTitle] = useState('');
    const [newPlanSubject, setNewPlanSubject] = useState('');

    // New task form
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskSubject, setNewTaskSubject] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');

    const refreshData = async () => {
        if (!userProfile?.uid) return;
        try {
            const [userPlans, userTasks] = await Promise.all([
                getStudyPlansByUser(userProfile.uid),
                getTasksByUser(userProfile.uid),
            ]);
            setPlans(userPlans);
            setTasks(userTasks);
            if (userPlans.length > 0 && !selectedPlanId) {
                setSelectedPlanId(userPlans[0].id);
            }
        } catch (err) {
            console.error('[CabinetStudyPlan] Refresh error:', err);
        }
    };

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const [userPlans, userTasks] = await Promise.all([
                    getStudyPlansByUser(userProfile.uid),
                    getTasksByUser(userProfile.uid),
                ]);
                if (!isMounted) return;
                setPlans(userPlans);
                setTasks(userTasks);
                if (userPlans.length > 0 && !selectedPlanId) {
                    setSelectedPlanId(userPlans[0].id);
                }
            } catch (err) {
                console.error('[CabinetStudyPlan] Error loading:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки данных', 'Error loading data'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t, selectedPlanId]);

    const handleCreatePlan = async () => {
        if (!userProfile?.uid || !newPlanTitle.trim()) return;
        setSaving(true);
        setError('');
        try {
            const plan = await createStudyPlan(userProfile.uid, {
                title: newPlanTitle.trim(),
                subject: newPlanSubject.trim(),
                type: planType,
            });
            setPlans(prev => [...prev, plan]);
            setSelectedPlanId(plan.id);
            setNewPlanTitle('');
            setNewPlanSubject('');
            setShowNewPlan(false);
            setSuccess(t('План создан!', 'Plan created!'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('[CabinetStudyPlan] Error creating plan:', err);
            setError(t('Ошибка создания плана', 'Error creating plan'));
        } finally {
            setSaving(false);
        }
    };

    const handleAddTask = async () => {
        if (!userProfile?.uid || !newTaskTitle.trim()) return;
        setSaving(true);
        setError('');
        try {
            if (selectedPlanId) {
                await createTask(userProfile.uid, selectedPlanId, {
                    title: newTaskTitle.trim(),
                    subject: newTaskSubject.trim(),
                    deadline: newTaskDeadline,
                });
            } else {
                await createSimpleTask(userProfile.uid, {
                    title: newTaskTitle.trim(),
                    subject: newTaskSubject.trim(),
                    deadline: newTaskDeadline,
                });
            }
            setNewTaskTitle('');
            setNewTaskSubject('');
            setNewTaskDeadline('');
            setSuccess(t('Задача добавлена!', 'Task added!'));
            setTimeout(() => setSuccess(''), 3000);
            await refreshData();
        } catch (err) {
            console.error('[CabinetStudyPlan] Error adding task:', err);
            setError(t('Ошибка добавления задачи', 'Error adding task'));
        } finally {
            setSaving(false);
        }
    };

    const handleToggleTask = async (task) => {
        setError('');
        try {
            if (task.planId) {
                await toggleTaskComplete(task.id, task.planId, !task.completed);
            } else {
                await toggleSimpleTask(task.id);
            }
            setTasks(prev =>
                prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
            );
        } catch (err) {
            console.error('[CabinetStudyPlan] Error toggling task:', err);
            setError(t('Ошибка обновления задачи', 'Error updating task'));
        }
    };

    const handleDeleteTask = async (taskId) => {
        setError('');
        try {
            const task = tasks.find(t => t.id === taskId);
            await deleteTask(taskId, task?.planId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setSuccess(t('Задача удалена', 'Task deleted'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('[CabinetStudyPlan] Error deleting task:', err);
            setError(t('Ошибка удаления задачи', 'Error deleting task'));
        }
    };

    // Filter tasks by selected plan (or all if no plan)
    const filteredTasks = selectedPlanId
        ? tasks.filter(task => task.planId === selectedPlanId)
        : tasks.filter(task => !task.planId);

    const completedCount = tasks.filter(t => t.completed).length;
    const inProgressCount = filteredTasks.filter(t => !t.completed).length;
    const progressPercent = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header">
                    <h1>{t('Учебный план', 'Study Plan')}</h1>
                </div>
                <div className="cabinet-empty">
                    <p>{t('Загрузка...', 'Loading...')}</p>
                </div>
            </CabinetLayout>
        );
    }

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Учебный план', 'Study Plan')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Планируйте обучение и отслеживайте прогресс', 'Plan your learning and track progress')}
                        </p>
                    </div>
                    <div className="cabinet-header-actions">
                        <button className="cabinet-btn" onClick={() => setShowNewPlan(!showNewPlan)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {t('Новый план', 'New Plan')}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="cabinet-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}
            {success && (
                <div className="cabinet-empty" style={{ border: '1px solid #10B981', background: 'rgba(16,185,129,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#10B981' }}>{success}</p>
                </div>
            )}

            {showNewPlan && (
                <div className="cabinet-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Новый учебный план', 'New Study Plan')}
                    </h3>
                    <div style={{ marginBottom: '12px' }}>
                        <label className="cabinet-label">{t('Название', 'Title')}</label>
                        <input
                            className="cabinet-input"
                            type="text"
                            placeholder={t('Название плана', 'Plan title')}
                            value={newPlanTitle}
                            onChange={(e) => setNewPlanTitle(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label className="cabinet-label">{t('Предмет', 'Subject')}</label>
                        <input
                            className="cabinet-input"
                            type="text"
                            placeholder={t('Математика, Физика...', 'Math, Physics...')}
                            value={newPlanSubject}
                            onChange={(e) => setNewPlanSubject(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        {[
                            { id: 'simple', label: t('Простой', 'Simple') },
                            { id: 'auto', label: t('Автоплан', 'Auto Plan') },
                            { id: 'manual', label: t('Ручной', 'Manual') },
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setPlanType(type.id)}
                                style={{
                                    padding: '6px 12px',
                                    background: planType === type.id ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: planType === type.id ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="cabinet-btn" onClick={handleCreatePlan} disabled={saving || !newPlanTitle.trim()}>
                            {saving ? t('Создание...', 'Creating...') : t('Создать план', 'Create Plan')}
                        </button>
                        <button className="cabinet-btn secondary" onClick={() => setShowNewPlan(false)}>
                            {t('Отмена', 'Cancel')}
                        </button>
                    </div>
                </div>
            )}

            {plans.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setSelectedPlanId('')}
                        style={{
                            padding: '6px 12px',
                            background: !selectedPlanId ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '6px',
                            color: !selectedPlanId ? '#fff' : 'var(--text-secondary)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {t('Все задачи', 'All Tasks')}
                    </button>
                    {plans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            style={{
                                padding: '6px 12px',
                                background: selectedPlanId === plan.id ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                                border: 'none',
                                borderRadius: '6px',
                                color: selectedPlanId === plan.id ? '#fff' : 'var(--text-secondary)',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            {plan.title}
                        </button>
                    ))}
                </div>
            )}

            <div className="cabinet-grid cabinet-grid-2" style={{ marginBottom: '32px' }}>
                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Прогресс', 'Progress')}
                    </h3>
                    <div className="cabinet-progress">
                        <div className="cabinet-progress-header">
                            <span className="cabinet-progress-label">{t('Выполнено', 'Completed')}</span>
                            <span className="cabinet-progress-value">{progressPercent}%</span>
                        </div>
                        <div className="cabinet-progress-bar">
                            <div className="cabinet-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#10B981' }}>{completedCount}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Выполнено', 'Done')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B' }}>{inProgressCount}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('В процессе', 'In Progress')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-muted)' }}>{filteredTasks.length}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Всего', 'Total')}</div>
                        </div>
                    </div>
                </div>

                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Новая задача', 'New Task')}
                    </h3>
                    <div style={{ marginBottom: '12px' }}>
                        <input
                            className="cabinet-input"
                            type="text"
                            placeholder={t('Название задачи', 'Task title')}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <input
                            className="cabinet-input"
                            type="text"
                            placeholder={t('Предмет', 'Subject')}
                            value={newTaskSubject}
                            onChange={(e) => setNewTaskSubject(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <input
                            className="cabinet-input"
                            type="date"
                            value={newTaskDeadline}
                            onChange={(e) => setNewTaskDeadline(e.target.value)}
                            style={{ flex: 1 }}
                        />
                    </div>
                    <button
                        className="cabinet-btn"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={handleAddTask}
                        disabled={saving || !newTaskTitle.trim()}
                    >
                        {saving ? t('Добавление...', 'Adding...') : t('Добавить задачу', 'Add Task')}
                    </button>
                </div>
            </div>

            <div className="cabinet-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {selectedPlanId ? `${t('Задачи плана', 'Plan Tasks')} (${filteredTasks.length})` : `${t('Все задачи', 'All Tasks')} (${filteredTasks.length})`}
                </h3>
                {filteredTasks.length === 0 ? (
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        <h3>{t('Нет задач', 'No tasks')}</h3>
                        <p>{t('Добавьте свою первую задачу', 'Add your first task')}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredTasks.map((task) => (
                            <div key={task.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                opacity: task.completed ? 0.6 : 1,
                            }}>
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleTask(task)}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        accentColor: 'var(--accent-primary)',
                                        cursor: 'pointer',
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: 'var(--text-primary)',
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                    }}>
                                        {task.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {task.subject && `${task.subject} • `}
                                        {task.planId && `${t('План', 'Plan')}: ${plans.find(p => p.id === task.planId)?.title || ''} • `}
                                        {task.deadline && task.deadline}
                                    </div>
                                </div>
                                <button
                                    className="cabinet-btn secondary"
                                    style={{ padding: '4px 12px', fontSize: '12px', color: '#EF4444' }}
                                    onClick={() => handleDeleteTask(task.id)}
                                >
                                    {t('Удалить', 'Delete')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CabinetLayout>
    );
}
