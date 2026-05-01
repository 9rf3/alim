import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetStudyPlan() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [planType, setPlanType] = useState('auto');

    const sampleTasks = [
        { id: 1, title: t('Изучить тему: Атомы и молекулы', 'Study topic: Atoms and Molecules'), subject: t('Химия', 'Chemistry'), deadline: '2026-05-05', completed: false },
        { id: 2, title: t('Решить задачи: Ньютоновские законы', 'Solve problems: Newton\'s Laws'), subject: t('Физика', 'Physics'), deadline: '2026-05-07', completed: true },
        { id: 3, title: t('Прочитать главу 5: Интегралы', 'Read chapter 5: Integrals'), subject: t('Математика', 'Mathematics'), deadline: '2026-05-10', completed: false },
    ];

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
                        <button className="cabinet-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {t('Новый план', 'New Plan')}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'auto', label: t('Автоплан', 'Auto Plan') },
                    { id: 'manual', label: t('Ручной план', 'Manual Plan') },
                    { id: 'personalized', label: t('Персональный', 'Personalized') },
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setPlanType(type.id)}
                        style={{
                            padding: '8px 16px',
                            background: planType === type.id ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: planType === type.id ? '#fff' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            <div className="cabinet-grid cabinet-grid-2" style={{ marginBottom: '32px' }}>
                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Прогресс плана', 'Plan Progress')}
                    </h3>
                    <div className="cabinet-progress">
                        <div className="cabinet-progress-header">
                            <span className="cabinet-progress-label">{t('Выполнено', 'Completed')}</span>
                            <span className="cabinet-progress-value">33%</span>
                        </div>
                        <div className="cabinet-progress-bar">
                            <div className="cabinet-progress-fill" style={{ width: '33%' }}></div>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)' }}>1</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Выполнено', 'Done')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B' }}>2</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('В процессе', 'In Progress')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-muted)' }}>5</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Ожидает', 'Pending')}</div>
                        </div>
                    </div>
                </div>

                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Ближайшие дедлайны', 'Upcoming Deadlines')}
                    </h3>
                    {sampleTasks.filter(task => !task.completed).slice(0, 3).map((task) => (
                        <div key={task.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: '1px solid var(--glass-border)',
                        }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{task.title}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.subject}</div>
                            </div>
                            <span style={{
                                padding: '4px 8px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#EF4444',
                            }}>
                                {task.deadline}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cabinet-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Задачи', 'Tasks')}
                </h3>
                {sampleTasks.map((task) => (
                    <div key={task.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 0',
                        borderBottom: '1px solid var(--glass-border)',
                        opacity: task.completed ? 0.6 : 1,
                    }}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            readOnly
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
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.subject}</div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{task.deadline}</span>
                    </div>
                ))}
            </div>
        </CabinetLayout>
    );
}
