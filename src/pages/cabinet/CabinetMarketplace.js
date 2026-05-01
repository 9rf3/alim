import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetMarketplace() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('buy');

    const listings = [
        {
            title: t('Проект: Химическая лаборатория', 'Project: Chemistry Lab'),
            seller: t('Проф. Иванов', 'Prof. Ivanov'),
            price: '29.99',
            type: 'project',
            rating: 4.9,
        },
        {
            title: t('Шаблон: Учебный план по физике', 'Template: Physics Study Plan'),
            seller: t('Студент Петров', 'Student Petrov'),
            price: '9.99',
            type: 'template',
            rating: 4.7,
        },
        {
            title: t('Заметки: Органическая химия', 'Notes: Organic Chemistry'),
            seller: t('Студент Сидорова', 'Student Sidorova'),
            price: '4.99',
            type: 'notes',
            rating: 4.5,
        },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Торговля проектами', 'Project Trading')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Покупайте, продавайте и обменивайтесь образовательными ресурсами', 'Buy, sell, and exchange educational resources')}
                        </p>
                    </div>
                    <div className="cabinet-header-actions">
                        <button className="cabinet-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {t('Разместить', 'List Item')}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                {[
                    { id: 'buy', label: t('Купить', 'Buy') },
                    { id: 'sell', label: t('Продать', 'Sell') },
                    { id: 'my', label: t('Мои предложения', 'My Listings') },
                ].map((tab) => (
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

            {activeTab === 'buy' && (
                <>
                    <div className="cabinet-grid cabinet-grid-3">
                        {listings.map((item, idx) => (
                            <div key={idx} className="cabinet-card clickable">
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        background: item.type === 'project' ? 'rgba(59, 130, 246, 0.1)' : item.type === 'template' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: item.type === 'project' ? '#3B82F6' : item.type === 'template' ? '#8B5CF6' : '#10B981',
                                    }}>
                                        {item.type === 'project' ? t('Проект', 'Project') : item.type === 'template' ? t('Шаблон', 'Template') : t('Заметки', 'Notes')}
                                    </span>
                                </div>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    {item.title}
                                </h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    {t('Продавец', 'Seller')}: {item.seller}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '12px', color: '#F59E0B' }}>★ {item.rating}</span>
                                    <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)' }}>${item.price}</span>
                                </div>
                                <button className="cabinet-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
                                    {t('Купить', 'Buy')}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'sell' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <h3>{t('Продайте свои проекты', 'Sell Your Projects')}</h3>
                        <p>{t('Разместите проекты, шаблоны или заметки для продажи', 'List projects, templates, or notes for sale')}</p>
                        <button className="cabinet-btn">{t('Создать предложение', 'Create Listing')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'my' && (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M4 12h16"/>
                        </svg>
                        <h3>{t('Нет активных предложений', 'No Active Listings')}</h3>
                        <p>{t('Ваши предложения появятся здесь', 'Your listings will appear here')}</p>
                        <button className="cabinet-btn">{t('Разместить', 'List Item')}</button>
                    </div>
                </div>
            )}
        </CabinetLayout>
    );
}
