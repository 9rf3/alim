import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetLaboratory() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('projects');

    const tabs = [
        { id: 'projects', label: t('Проекты', 'Projects') },
        { id: 'code', label: t('Редактор кода', 'Code Editor') },
        { id: 'library', label: t('Библиотека проектов', 'Project Library') },
        { id: 'simulator', label: t('3D Симулятор', '3D Simulator') },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Лаборатория', 'Laboratory')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Создание, эксперименты и торговля проектами', 'Creation, experimentation, and project trading')}
                        </p>
                    </div>
                    <div className="cabinet-header-actions">
                        <button className="cabinet-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {t('Новый проект', 'New Project')}
                        </button>
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
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'projects' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/>
                            <path d="M6 8H18"/>
                        </svg>
                        <h3>{t('У вас пока нет проектов', 'You have no projects yet')}</h3>
                        <p>{t('Создайте свой первый проект или закажите у преподавателя', 'Create your first project or order from a teacher')}</p>
                        <button className="cabinet-btn">{t('Создать проект', 'Create Project')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'code' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                        </svg>
                        <h3>{t('Редактор кода', 'Code Editor')}</h3>
                        <p>{t('Пишите код прямо в браузере. Поддержка Python, JavaScript и других языков', 'Write code directly in the browser. Support for Python, JavaScript, and other languages')}</p>
                        <button className="cabinet-btn">{t('Открыть редактор', 'Open Editor')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'library' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <h3>{t('Библиотека проектов', 'Project Library')}</h3>
                        <p>{t('Готовые проекты, шаблоны и учебные примеры', 'Ready-made projects, templates, and educational examples')}</p>
                        <button className="cabinet-btn">{t('Просмотреть', 'Browse')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'simulator' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"/><path d="M12 3c4.97 0 9 2.69 9 6s-4.03 6-9 6-9-2.69-9-6 4.03-6 9-6z"/>
                        </svg>
                        <h3>{t('3D Симулятор', '3D Simulator')}</h3>
                        <p>{t('Интерактивные симуляции по физике, химии и математике', 'Interactive simulations for physics, chemistry, and mathematics')}</p>
                        <button className="cabinet-btn">{t('Запустить', 'Launch')}</button>
                    </div>
                </div>
            )}
        </CabinetLayout>
    );
}
