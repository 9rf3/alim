import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { getSubscriptionsByUser, createSubscription, cancelSubscription } from '../../services/firestore';

export default function CabinetPayment() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const [billingCycle, setBillingCycle] = useState('monthly');

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadSubscriptions = async () => {
            try {
                const userSubs = await getSubscriptionsByUser(userProfile.uid);
                if (!isMounted) return;
                setSubscriptions(userSubs);
            } catch (err) {
                console.error('[CabinetPayment] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки подписок', 'Error loading subscriptions'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadSubscriptions();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const currentPlan = subscriptions.find(s => s.status === 'active');

    const refreshSubscriptions = async () => {
        if (!userProfile?.uid) return;
        try {
            const userSubs = await getSubscriptionsByUser(userProfile.uid);
            setSubscriptions(userSubs);
        } catch (err) {
            console.error('[CabinetPayment] Refresh error:', err);
        }
    };

    const handleSubscribe = async (planId) => {
        if (!userProfile?.uid) return;
        setSubscribing(true);
        setError('');
        setSuccess('');
        try {
            await createSubscription(userProfile.uid, {
                planId,
                billingCycle,
                startedAt: new Date().toISOString(),
            });
            setSuccess(t('Подписка активирована!', 'Subscription activated!'));
            await refreshSubscriptions();
        } catch (err) {
            console.error('[CabinetPayment] Subscribe error:', err);
            setError(err.message || t('Ошибка активации подписки', 'Error activating subscription'));
        } finally {
            setSubscribing(false);
        }
    };

    const handleCancel = async (subId) => {
        setError('');
        setSuccess('');
        try {
            await cancelSubscription(subId);
            setSuccess(t('Подписка отменена', 'Subscription cancelled'));
            await refreshSubscriptions();
        } catch (err) {
            console.error('[CabinetPayment] Cancel error:', err);
            setError(err.message || t('Ошибка отмены подписки', 'Error cancelling subscription'));
        }
    };

    const plans = [
        {
            id: 'free',
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
            current: !currentPlan || currentPlan?.planId === 'free',
        },
        {
            id: 'student',
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
            current: currentPlan?.planId === 'student',
            popular: true,
        },
        {
            id: 'teacher',
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
            current: currentPlan?.planId === 'teacher',
        },
    ];

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header">
                    <h1>{t('Подписка и оплата', 'Subscription & Payment')}</h1>
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
                        <h1>{t('Подписка и оплата', 'Subscription & Payment')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Выберите план, который подходит именно вам', 'Choose the plan that fits you best')}
                        </p>
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

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', padding: '4px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
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
                {plans.map((plan) => (
                    <div
                        key={plan.id}
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
                        {plan.current ? (
                            <button
                                className="cabinet-btn"
                                style={{ width: '100%', justifyContent: 'center', opacity: 0.7 }}
                                disabled
                            >
                                {plan.cta}
                            </button>
                        ) : (
                            <button
                                className="cabinet-btn"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={subscribing}
                            >
                                {subscribing ? t('Активация...', 'Activating...') : plan.cta}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="cabinet-card" style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('История подписок', 'Subscription History')}
                </h3>
                {subscriptions.length === 0 ? (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {t('У вас пока нет подписок', 'You have no subscriptions yet')}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {subscriptions.map((sub) => (
                            <div key={sub.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                        {sub.planId === 'free' ? t('Бесплатный', 'Free') : sub.planId === 'student' ? t('Студент', 'Student') : t('Преподаватель', 'Teacher')}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {sub.billingCycle === 'yearly' ? t('Ежегодно', 'Yearly') : t('Ежемесячно', 'Monthly')}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        background: sub.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: sub.status === 'active' ? '#10B981' : '#EF4444',
                                    }}>
                                        {sub.status === 'active' ? t('Активна', 'Active') : t('Отменена', 'Cancelled')}
                                    </span>
                                    {sub.status === 'active' && (
                                        <button
                                            className="cabinet-btn secondary"
                                            style={{ padding: '4px 12px', fontSize: '12px' }}
                                            onClick={() => handleCancel(sub.id)}
                                        >
                                            {t('Отменить', 'Cancel')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CabinetLayout>
    );
}
