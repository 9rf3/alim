import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherPricing() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [discountType, setDiscountType] = useState('percent');

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Управление ценами', 'Pricing Control')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Устанавливайте цены, скидки и акции для ваших курсов', 'Set prices, discounts, and promotions for your courses')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="teacher-grid teacher-grid-2">
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {t('Цены курсов', 'Course Pricing')}
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="teacher-label">{t('Выберите курс', 'Select Course')}</label>
                        <select className="teacher-select">
                            <option>{t('— Выберите курс —', '— Select Course —')}</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="teacher-label">{t('Базовая цена ($)', 'Base Price ($)')}</label>
                        <input className="teacher-input" type="number" placeholder="29.99" />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="teacher-label">{t('Скидка', 'Discount')}</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            {['percent', 'fixed'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setDiscountType(type)}
                                    style={{
                                        padding: '6px 12px',
                                        background: discountType === type ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: discountType === type ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {type === 'percent' ? '%' : '$'}
                                </button>
                            ))}
                        </div>
                        <input className="teacher-input" type="number" placeholder={discountType === 'percent' ? '20' : '5'} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="teacher-label">{t('Бесплатный урок', 'Free Lesson')}</label>
                        <select className="teacher-select">
                            <option>{t('Нет бесплатных уроков', 'No free lessons')}</option>
                            <option>{t('Первый урок бесплатный', 'First lesson free')}</option>
                            <option>{t('Несколько уроков', 'Multiple lessons')}</option>
                        </select>
                    </div>

                    <button className="teacher-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        {t('Сохранить цены', 'Save Pricing')}
                    </button>
                </div>

                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {t('Пакетные предложения', 'Bundles')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        <h3>{t('Нет пакетов', 'No bundles')}</h3>
                        <p>{t('Создайте пакетные предложения из нескольких курсов', 'Create bundle deals from multiple courses')}</p>
                        <button className="teacher-btn">{t('Создать пакет', 'Create Bundle')}</button>
                    </div>
                </div>
            </div>

            <div className="teacher-card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Активные цены', 'Active Pricing')}
                </h3>
                <div className="teacher-empty">
                    <p>{t('Установите цены для ваших курсов, чтобы они появились здесь', 'Set prices for your courses to see them here')}</p>
                </div>
            </div>
        </TeacherLayout>
    );
}
