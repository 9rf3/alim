import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { getSubscriptionsByUser, createSubscription, cancelSubscription } from '../../services/firestore';

const STUDENT_PLANS = [
    {
        id: 'free', nameEn: 'Free', nameRu: 'Бесплатный',
        monthlyPrice: 0, yearlyPrice: 0,
        descriptionEn: 'Get started with basic access', descriptionRu: 'Начните с базового доступа',
        features: [
            { en: '5 experiments per month', ru: '5 экспериментов в месяц' },
            { en: 'Basic lab access', ru: 'Базовый доступ к лаборатории' },
            { en: 'Community support', ru: 'Поддержка сообщества' },
            { en: 'Public library access', ru: 'Доступ к публичной библиотеке' },
        ],
        popular: false,
        color: '#6B7280',
    },
    {
        id: 'standard', nameEn: 'Standard', nameRu: 'Стандартный',
        monthlyPrice: 12, yearlyPrice: 115,
        descriptionEn: 'For serious learners', descriptionRu: 'Для серьёзного обучения',
        features: [
            { en: 'Unlimited experiments', ru: 'Безлимитные эксперименты' },
            { en: 'Full lab access', ru: 'Полный доступ к лаборатории' },
            { en: 'Study plans & progress', ru: 'Учебные планы и прогресс' },
            { en: 'Priority email support', ru: 'Приоритетная поддержка' },
            { en: 'Advanced simulations', ru: 'Продвинутые симуляции' },
            { en: 'Downloadable resources', ru: 'Скачиваемые ресурсы' },
        ],
        popular: true,
        color: '#3B82F6',
    },
    {
        id: 'pro', nameEn: 'Pro', nameRu: 'Про',
        monthlyPrice: 24, yearlyPrice: 230,
        descriptionEn: 'For power learners', descriptionRu: 'Для продвинутого обучения',
        features: [
            { en: 'Everything in Standard', ru: 'Всё из Standard' },
            { en: 'AI-powered recommendations', ru: 'AI-рекомендации' },
            { en: 'Custom experiment creation', ru: 'Создание своих экспериментов' },
            { en: 'Offline mode', ru: 'Офлайн-режим' },
            { en: 'Certificate generation', ru: 'Генерация сертификатов' },
            { en: '24/7 priority support', ru: 'Круглосуточная поддержка' },
        ],
        popular: false,
        color: '#8B5CF6',
    },
    {
        id: 'apple_plus', nameEn: 'Apple Plus', nameRu: 'Apple Plus',
        monthlyPrice: 49, yearlyPrice: 470,
        descriptionEn: 'The ultimate learning experience', descriptionRu: 'Максимальные возможности',
        features: [
            { en: 'Everything in Pro', ru: 'Всё из Pro' },
            { en: '1-on-1 tutoring sessions', ru: 'Индивидуальные занятия' },
            { en: 'VIP teacher access', ru: 'VIP-доступ к преподавателям' },
            { en: 'Early access to features', ru: 'Ранний доступ к функциям' },
            { en: 'Custom curriculum design', ru: 'Индивидуальная программа' },
            { en: 'Dedicated account manager', ru: 'Персональный менеджер' },
        ],
        popular: false,
        color: '#F59E0B',
    },
];

const TEACHER_PLANS = [
    {
        id: 'teacher_free', nameEn: 'Free Teacher', nameRu: 'Бесплатный',
        monthlyPrice: 0, yearlyPrice: 0,
        descriptionEn: 'Start teaching today', descriptionRu: 'Начните преподавать сегодня',
        features: [
            { en: 'Up to 3 courses', ru: 'До 3 курсов' },
            { en: 'Basic analytics', ru: 'Базовая аналитика' },
            { en: 'Up to 30 students', ru: 'До 30 учеников' },
            { en: 'Community support', ru: 'Поддержка сообщества' },
        ],
        popular: false,
        color: '#6B7280',
    },
    {
        id: 'teacher_standard', nameEn: 'Standard Teacher', nameRu: 'Стандартный',
        monthlyPrice: 19, yearlyPrice: 182,
        descriptionEn: 'For professional educators', descriptionRu: 'Для профессиональных педагогов',
        features: [
            { en: 'Unlimited courses', ru: 'Безлимитные курсы' },
            { en: 'Full analytics suite', ru: 'Полная аналитика' },
            { en: 'Up to 200 students', ru: 'До 200 учеников' },
            { en: 'Priority support', ru: 'Приоритетная поддержка' },
            { en: 'Custom branding', ru: 'Собственный брендинг' },
            { en: 'Quiz & test builder', ru: 'Конструктор тестов' },
        ],
        popular: true,
        color: '#8B5CF6',
    },
    {
        id: 'teacher_pro', nameEn: 'Pro Teacher', nameRu: 'Про',
        monthlyPrice: 39, yearlyPrice: 374,
        descriptionEn: 'For teaching professionals', descriptionRu: 'Для профессионалов',
        features: [
            { en: 'Everything in Standard', ru: 'Всё из Standard' },
            { en: 'Unlimited students', ru: 'Безлимитные ученики' },
            { en: 'AI grading assistant', ru: 'AI-проверка работ' },
            { en: 'Certificate issuance', ru: 'Выдача сертификатов' },
            { en: 'Revenue analytics', ru: 'Аналитика доходов' },
            { en: 'Marketing tools', ru: 'Инструменты продвижения' },
        ],
        popular: false,
        color: '#EF4444',
    },
    {
        id: 'teacher_apple_plus', nameEn: 'Apple Plus Teacher', nameRu: 'Apple Plus',
        monthlyPrice: 79, yearlyPrice: 758,
        descriptionEn: 'The ultimate teaching platform', descriptionRu: 'Максимальные возможности',
        features: [
            { en: 'Everything in Pro', ru: 'Всё из Pro' },
            { en: 'Dedicated success manager', ru: 'Персональный менеджер' },
            { en: 'White-label platform', ru: 'White-label платформа' },
            { en: 'API access', ru: 'API-доступ' },
            { en: 'Bulk student import', ru: 'Массовый импорт учеников' },
            { en: 'Custom integrations', ru: 'Пользовательские интеграции' },
        ],
        popular: false,
        color: '#F59E0B',
    },
];

export default function CabinetPayment() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    const [activeTab, setActiveTab] = useState('student');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const plans = activeTab === 'student' ? STUDENT_PLANS : TEACHER_PLANS;

    useEffect(() => {
        if (!userProfile?.uid) return;
        let mounted = true;
        const load = async () => {
            try {
                const subs = await getSubscriptionsByUser(userProfile.uid);
                if (mounted) setSubscriptions(subs);
            } catch (err) {
                console.error('[CabinetPayment] Error:', err);
                if (mounted) setError(err.message || t('Ошибка загрузки', 'Error loading'));
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [userProfile?.uid, t]);

    const currentPlan = subscriptions.find(s => s.status === 'active');
    const isCurrentPlan = (planId) => currentPlan?.planId === planId;

    const refreshSubs = async () => {
        if (!userProfile?.uid) return;
        try {
            const subs = await getSubscriptionsByUser(userProfile.uid);
            setSubscriptions(subs);
        } catch (err) {
            console.error('[CabinetPayment] Refresh:', err);
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
                type: activeTab,
                startedAt: new Date().toISOString(),
            });
            setSuccess(t('Подписка активирована!', 'Subscription activated!'));
            await refreshSubs();
        } catch (err) {
            setError(err.message || t('Ошибка активации', 'Error activating'));
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
            await refreshSubs();
        } catch (err) {
            setError(err.message || t('Ошибка отмены', 'Error cancelling'));
        }
    };

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header"><h1>{t('Подписка', 'Subscription')}</h1></div>
                <div className="cabinet-empty"><p>{t('Загрузка...', 'Loading...')}</p></div>
            </CabinetLayout>
        );
    }

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Подписка', 'Subscription')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Выберите план, который подходит именно вам', 'Choose the plan that fits you best')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="cabinet-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: 16, borderRadius: 12 }}>
                    <p style={{ color: '#EF4444', margin: 0 }}>{error}</p>
                </div>
            )}
            {success && (
                <div className="cabinet-empty" style={{ border: '1px solid #10B981', background: 'rgba(16,185,129,0.1)', marginBottom: 16, borderRadius: 12 }}>
                    <p style={{ color: '#10B981', margin: 0 }}>{success}</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid var(--glass-border)', paddingBottom: 16 }}>
                <button
                    className={`cabinet-tab ${activeTab === 'student' ? 'active' : ''}`}
                    onClick={() => setActiveTab('student')}
                >
                    {t('Для учеников', 'For Students')}
                </button>
                <button
                    className={`cabinet-tab ${activeTab === 'teacher' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teacher')}
                >
                    {t('Для учителей', 'For Teachers')}
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
                <div style={{
                    display: 'flex', padding: 4, background: 'var(--bg-tertiary)',
                    borderRadius: 12, position: 'relative'
                }}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        style={{
                            padding: '10px 24px',
                            background: billingCycle === 'monthly' ? 'var(--bg-primary)' : 'transparent',
                            border: 'none', borderRadius: 8,
                            fontSize: 14, fontWeight: 600,
                            color: billingCycle === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer', fontFamily: 'inherit',
                            boxShadow: billingCycle === 'monthly' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s ease', position: 'relative', zIndex: 1,
                        }}
                    >
                        {t('Ежемесячно', 'Monthly')}
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        style={{
                            padding: '10px 24px',
                            background: billingCycle === 'yearly' ? 'var(--bg-primary)' : 'transparent',
                            border: 'none', borderRadius: 8,
                            fontSize: 14, fontWeight: 600,
                            color: billingCycle === 'yearly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer', fontFamily: 'inherit',
                            boxShadow: billingCycle === 'yearly' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s ease', position: 'relative', zIndex: 1,
                        }}
                    >
                        {t('Ежегодно', 'Yearly')}
                        <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: 4 }}>
                            -20%
                        </span>
                    </button>
                </div>
            </div>

            <div className="cabinet-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
                {plans.map((plan) => {
                    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                    const period = billingCycle === 'monthly'
                        ? t('/мес', '/mo')
                        : t('/год', '/yr');
                    const isCurrent = isCurrentPlan(plan.id);

                    return (
                        <div
                            key={plan.id}
                            style={{
                                position: 'relative',
                                background: 'var(--glass-bg)',
                                backdropFilter: 'blur(20px)',
                                border: `2px solid ${plan.popular ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                                borderRadius: 20,
                                padding: '32px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: plan.popular ? '0 0 40px var(--glow-primary)' : 'var(--glass-shadow)',
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: -14, left: '50%',
                                    transform: 'translateX(-50%)',
                                    padding: '6px 18px',
                                    background: 'var(--accent-gradient)',
                                    borderRadius: 20,
                                    fontSize: 12, fontWeight: 700, color: '#fff',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 12px rgba(10,132,255,0.4)',
                                }}>
                                    {t('Рекомендуем', 'Recommended')}
                                </div>
                            )}

                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{
                                    fontSize: 18, fontWeight: 700,
                                    color: 'var(--text-primary)', marginBottom: 4
                                }}>
                                    {language === 'ru' ? plan.nameRu : plan.nameEn}
                                </h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                                    {language === 'ru' ? plan.descriptionRu : plan.descriptionEn}
                                </p>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                {price === 0 ? (
                                    <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {t('Бесплатно', 'Free')}
                                    </span>
                                ) : (
                                    <>
                                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', verticalAlign: 'top', marginRight: 2 }}>
                                            $
                                        </span>
                                        <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                            {price}
                                        </span>
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 2 }}>
                                            {period}
                                        </span>
                                        {billingCycle === 'yearly' && price > 0 && (
                                            <div style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
                                                ${(plan.monthlyPrice * 12).toFixed(0)} {t('в месяц', '/mo value')}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <ul style={{
                                listStyle: 'none', padding: 0, margin: 0, marginBottom: 28, flex: 1,
                                display: 'flex', flexDirection: 'column', gap: 10,
                            }}>
                                {plan.features.map((f, i) => (
                                    <li key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        fontSize: 13, color: 'var(--text-secondary)',
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        {language === 'ru' ? f.ru : f.en}
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button
                                    disabled
                                    style={{
                                        padding: '14px 24px',
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 12,
                                        fontSize: 14, fontWeight: 700,
                                        color: 'var(--text-muted)',
                                        cursor: 'not-allowed',
                                        fontFamily: 'inherit',
                                        width: '100%',
                                        textAlign: 'center',
                                        opacity: 0.7,
                                    }}
                                >
                                    {t('Текущий план', 'Current Plan')}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={subscribing}
                                    style={{
                                        padding: '14px 24px',
                                        background: plan.popular ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                                        border: plan.popular ? 'none' : '1px solid var(--glass-border)',
                                        borderRadius: 12,
                                        fontSize: 14, fontWeight: 700,
                                        color: plan.popular ? '#fff' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        width: '100%',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                        boxShadow: plan.popular ? '0 4px 16px rgba(10,132,255,0.3)' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!plan.popular) {
                                            e.target.style.background = 'var(--bg-secondary)';
                                            e.target.style.borderColor = 'var(--accent-primary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!plan.popular) {
                                            e.target.style.background = 'var(--bg-tertiary)';
                                            e.target.style.borderColor = 'var(--glass-border)';
                                        }
                                    }}
                                >
                                    {subscribing
                                        ? t('Активация...', 'Activating...')
                                        : price === 0
                                            ? t('Начать бесплатно', 'Start Free')
                                            : t('Подписаться', 'Subscribe')
                                    }
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {currentPlan && (
                <div className="cabinet-card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                        {t('Текущая подписка', 'Current Subscription')}
                    </h3>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 16, background: 'var(--bg-tertiary)', borderRadius: 12,
                        border: '1px solid var(--glass-border)',
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15, marginBottom: 4 }}>
                                {currentPlan.planId}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                {currentPlan.billingCycle === 'yearly' ? t('Ежегодно', 'Yearly') : t('Ежемесячно', 'Monthly')}
                                <span style={{
                                    marginLeft: 8, padding: '2px 8px', borderRadius: 4,
                                    fontSize: 11, fontWeight: 600,
                                    background: 'rgba(16,185,129,0.15)', color: '#10B981',
                                }}>
                                    {t('Активна', 'Active')}
                                </span>
                            </div>
                        </div>
                        <button
                            className="cabinet-btn secondary"
                            style={{ padding: '8px 16px', fontSize: 12 }}
                            onClick={() => handleCancel(currentPlan.id)}
                        >
                            {t('Отменить', 'Cancel')}
                        </button>
                    </div>
                </div>
            )}

            <div className="cabinet-card">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                    {t('История', 'History')}
                </h3>
                {subscriptions.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        {t('У вас пока нет подписок', 'No subscription history yet')}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {subscriptions.map((sub) => (
                            <div key={sub.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 8,
                                border: '1px solid var(--glass-border)',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                                        {sub.planId}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                        {sub.billingCycle === 'yearly' ? t('Ежегодно', 'Yearly') : t('Ежемесячно', 'Monthly')}
                                    </div>
                                </div>
                                <span style={{
                                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                    background: sub.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: sub.status === 'active' ? '#10B981' : '#EF4444',
                                }}>
                                    {sub.status === 'active' ? t('Активна', 'Active') : t('Отменена', 'Cancelled')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CabinetLayout>
    );
}