import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetEditor() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('lessons');

    const tabs = [
        { id: 'lessons', label: t('Видеоуроки', 'Video Lessons') },
        { id: 'resources', label: t('Ресурсы', 'Resources') },
        { id: 'quizzes', label: t('Тесты', 'Quizzes') },
        { id: 'notes', label: t('Заметки', 'Notes') },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Редактор обучения', 'Learning Workspace')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Ваша персональная учебная студия', 'Your personal study studio')}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 16px',
                            background: activeTab === tab.id ? 'var(--accent-gradient)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'lessons' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <h3>{t('Видеоуроки', 'Video Lessons')}</h3>
                        <p>{t('Смотрите уроки и отслеживайте прогресс обучения', 'Watch lessons and track your learning progress')}</p>
                        <button className="cabinet-btn">{t('Начать обучение', 'Start Learning')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <h3>{t('Учебные ресурсы', 'Study Resources')}</h3>
                        <p>{t('Доступ к материалам курсов и дополнительным ресурсам', 'Access to course materials and additional resources')}</p>
                        <button className="cabinet-btn">{t('Открыть ресурсы', 'Open Resources')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'quizzes' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <h3>{t('Тесты и викторины', 'Tests & Quizzes')}</h3>
                        <p>{t('Проверяйте свои знания с помощью интерактивных тестов', 'Test your knowledge with interactive quizzes')}</p>
                        <button className="cabinet-btn">{t('Пройти тест', 'Take Quiz')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <h3>{t('Мои заметки', 'My Notes')}</h3>
                        <p>{t('Создавайте и организуйте учебные заметки', 'Create and organize study notes')}</p>
                        <button className="cabinet-btn">{t('Создать заметку', 'Create Note')}</button>
                    </div>
                </div>
            )}
        </CabinetLayout>
    );
}
