import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherLaboratory() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('orders');

    const tabs = [
        { id: 'orders', label: t('Заказы', 'Orders') },
        { id: 'examples', label: t('Примеры', 'Examples') },
        { id: 'publish', label: t('Публикация', 'Publish') },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Лаборатория учителя', 'Teacher Laboratory')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Принимайте заказы, создавайте примеры и публикуйте проекты', 'Accept orders, create examples, and publish projects')}
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
                            background: activeTab === tab.id ? 'linear-gradient(135deg, var(--accent-secondary), #EF4444)' : 'transparent',
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

            {activeTab === 'orders' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Заказы от учеников', 'Student Orders')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/><path d="M6 8H18"/>
                        </svg>
                        <h3>{t('Нет заказов', 'No orders')}</h3>
                        <p>{t('Заказы от учеников на проекты появятся здесь', 'Student project orders will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'examples' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Образовательные примеры', 'Educational Examples')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"/><path d="M12 3c4.97 0 9 2.69 9 6s-4.03 6-9 6-9-2.69-9-6 4.03-6 9-6z"/>
                        </svg>
                        <h3>{t('Нет примеров', 'No examples')}</h3>
                        <p>{t('Создавайте демонстрации и симуляции для учеников', 'Create demonstrations and simulations for students')}</p>
                        <button className="teacher-btn">{t('Создать пример', 'Create Example')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'publish' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Публикация проектов', 'Publish Projects')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <h3>{t('Публикация на маркетплейс', 'Publish to Marketplace')}</h3>
                        <p>{t('Загрузите и продавайте проекты на маркетплейсе', 'Upload and sell projects on the marketplace')}</p>
                        <button className="teacher-btn">{t('Опубликовать проект', 'Publish Project')}</button>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
