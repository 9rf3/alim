import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetPayment() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            name: t('Бесплатный', 'Free'),
            price: '0',
            period: t('/мес', '/mo'),
            description: t('Базовый доступ к платформе', 'Basic platform access'),
            features: [
                t('Доступ к базовым лабораториям', 'Access to basic labs'),
                t('5 симуляций в месяц', '5 simulations per month'),
                t('Ограниченная библиотека', 'Limited library'),
                t('Базовые сертификаты', 'Basic certificates'),
            ],
            cta: t('Текущий план', 'Current Plan'),
            current: true,
        },
        {
            name: t('Студент', 'Student'),
            price: billingCycle === 'monthly' ? '9.99' : '99.99',
            period: billingCycle === 'monthly' ? t('/мес', '/mo') : t('/год', '/yr'),
            description: t('Полный доступ для учащихся', 'Full access for students'),
            features: [
                t('Все лаборатории и симуляции', 'All labs and simulations'),
                t('Безлимитная библиотека', 'Unlimited library'),
                t('Учебные планы', 'Study plans'),
                t('Приоритетная поддержка', 'Priority support'),
                t('Расширенные сертификаты', 'Advanced certificates'),
            ],
            cta: t('Начать 7-дневный триал', 'Start 7-Day Trial'),
            current: false,
            popular: true,
        },
        {
            name: t('Преподаватель', 'Teacher'),
            price: billingCycle === 'monthly' ? '19.99' : '199.99',
            period: billingCycle === 'monthly' ? t('/мес', '/mo') : t('/год', '/yr'),
            description: t('Инструменты для преподавания', 'Tools for teaching'),
            features: [
                t('Всё из плана «Студент»', 'Everything in Student plan'),
                t('Создание курсов', 'Course creation'),
                t('Управление студентами', 'Student management'),
                t('Аналитика прогресса', 'Progress analytics'),
                t('Выдача сертификатов', 'Certificate issuance'),
                t('7-дневный триал', '7-day trial'),
            ],
            cta: t('Начать 7-дневный триал', 'Start 7-Day Trial'),
            current: false,
        },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Подписка и оплата', 'Subscription & Payment')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Выберите план, который подходит именно вам', 'Choose the plan that fits you best')}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{
                    display: 'flex',
                    padding: '4px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                }}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        style={{
                            padding: '8px 20px',
                            background: billingCycle === 'monthly' ? 'var(--bg-primary)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: billingCycle === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            boxShadow: billingCycle === 'monthly' ? 'var(--shadow-sm)' : 'none',
                        }}
                    >
                        {t('Ежемесячно', 'Monthly')}
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        style={{
                            padding: '8px 20px',
                            background: billingCycle === 'yearly' ? 'var(--bg-primary)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: billingCycle === 'yearly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            boxShadow: billingCycle === 'yearly' ? 'var(--shadow-sm)' : 'none',
                        }}
                    >
                        {t('Ежегодно', 'Yearly')}
                        <span style={{ marginLeft: '6px', fontSize: '11px', color: '#10B981' }}>-20%</span>
                    </button>
                </div>
            </div>

            <div className="cabinet-grid cabinet-grid-3">
                {plans.map((plan, idx) => (
                    <div
                        key={idx}
                        className="cabinet-card"
                        style={{
                            position: 'relative',
                            borderColor: plan.popular ? 'var(--accent-primary)' : 'var(--glass-border)',
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '4px 12px',
                                background: 'var(--accent-gradient)',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#fff',
                            }}>
                                {t('Популярный', 'Popular')}
                            </div>
                        )}
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {plan.name}
                        </h3>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                ${plan.price}
                            </span>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{plan.period}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            {plan.description}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                            {plan.features.map((feature, fIdx) => (
                                <li key={fIdx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 0',
                                    fontSize: '13px',
                                    color: 'var(--text-secondary)',
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            className="cabinet-btn"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                opacity: plan.current ? 0.7 : 1,
                            }}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            <div className="cabinet-card" style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {t('История подписок', 'Subscription History')}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {t('Здесь будет отображаться история ваших подписок и платежей', 'Your subscription and payment history will be displayed here')}
                </p>
            </div>
        </CabinetLayout>
    );
}
