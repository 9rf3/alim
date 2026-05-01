import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetLibrary() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', label: t('Все', 'All') },
        { id: 'textbooks', label: t('Учебники', 'Textbooks') },
        { id: 'notes', label: t('Заметки', 'Notes') },
        { id: 'pdfs', label: t('PDF материалы', 'PDF Materials') },
        { id: 'recommended', label: t('Рекомендованные', 'Recommended') },
    ];

    const resources = [
        {
            title: t('Химия: Основы органической химии', 'Chemistry: Organic Chemistry Basics'),
            type: 'textbook',
            author: t('Проф. Иванов', 'Prof. Ivanov'),
            price: '14.99',
            rentPrice: '4.99',
            rating: 4.8,
            saved: false,
        },
        {
            title: t('Физика: Механика и динамика', 'Physics: Mechanics and Dynamics'),
            type: 'textbook',
            author: t('Проф. Петров', 'Prof. Petrov'),
            price: '12.99',
            rentPrice: '3.99',
            rating: 4.6,
            saved: false,
        },
        {
            title: t('Математика: Формулы и теоремы', 'Mathematics: Formulas and Theorems'),
            type: 'notes',
            author: t('Студент Сидоров', 'Student Sidorov'),
            price: '5.99',
            rentPrice: '1.99',
            rating: 4.5,
            saved: true,
        },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Библиотека', 'Library')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Учебники, заметки и образовательные ресурсы', 'Textbooks, notes, and educational resources')}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21L16.65 16.65"/>
                    </svg>
                    <input
                        type="text"
                        placeholder={t('Поиск ресурсов...', 'Search resources...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            outline: 'none',
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '8px 16px',
                            background: activeCategory === cat.id ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="cabinet-grid cabinet-grid-3">
                {resources.map((resource, idx) => (
                    <div key={idx} className="cabinet-card">
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{
                                padding: '4px 8px',
                                background: resource.type === 'textbook' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: resource.type === 'textbook' ? '#3B82F6' : '#8B5CF6',
                            }}>
                                {resource.type === 'textbook' ? t('Учебник', 'Textbook') : t('Заметки', 'Notes')}
                            </span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {resource.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            {resource.author}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '12px', color: '#F59E0B' }}>
                                ★ {resource.rating}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="cabinet-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '8px' }}>
                                {t('Купить', 'Buy')} — ${resource.price}
                            </button>
                            <button className="cabinet-btn secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '8px' }}>
                                {t('Аренда', 'Rent')} — ${resource.rentPrice}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </CabinetLayout>
    );
}
