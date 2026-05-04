import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getCoursesByTeacher, getCoursePricing, setCoursePricing } from '../../services/firestore';

export default function TeacherPricing() {
    const { userProfile } = useAuth();
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [discountType, setDiscountType] = useState('percent');
    const [discountValue, setDiscountValue] = useState('');
    const [freeLesson, setFreeLesson] = useState('none');
    const [pricingList, setPricingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const refreshData = async () => {
        if (!userProfile?.uid) return;
        try {
            const teacherCourses = await getCoursesByTeacher(userProfile.uid);
            setCourses(teacherCourses);

            const pricingPromises = teacherCourses.map(c =>
                getCoursePricing(userProfile.uid, c.id).then(p => p ? { ...p, courseTitle: c.title } : null)
            );
            const pricingResults = await Promise.all(pricingPromises);
            setPricingList(pricingResults.filter(Boolean));
        } catch (err) {
            console.error('[TeacherPricing] Refresh error:', err);
        }
    };

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const teacherCourses = await getCoursesByTeacher(userProfile.uid);
                if (!isMounted) return;
                setCourses(teacherCourses);

                const pricingPromises = teacherCourses.map(c =>
                    getCoursePricing(userProfile.uid, c.id).then(p => p ? { ...p, courseTitle: c.title } : null)
                );
                const pricingResults = await Promise.all(pricingPromises);
                if (!isMounted) return;
                setPricingList(pricingResults.filter(Boolean));
            } catch (err) {
                console.error('[TeacherPricing] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки данных', 'Error loading data'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const handleSave = async () => {
        if (!selectedCourseId || !basePrice) {
            setError(t('Выберите курс и укажите цену', 'Select a course and enter a price'));
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const selectedCourse = courses.find(c => c.id === selectedCourseId);
            await setCoursePricing(userProfile.uid, selectedCourseId, {
                basePrice: parseFloat(basePrice),
                discountType,
                discountValue: discountValue ? parseFloat(discountValue) : 0,
                freeLesson,
                courseTitle: selectedCourse?.title || '',
            });
            setSuccess(t('Цена сохранена!', 'Pricing saved!'));
            setBasePrice('');
            setDiscountValue('');
            setFreeLesson('none');
            await refreshData();
        } catch (err) {
            setError(t('Ошибка сохранения', 'Error saving'));
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <TeacherLayout>
                <div className="teacher-header">
                    <h1>{t('Управление ценами', 'Pricing Control')}</h1>
                </div>
                <div className="teacher-empty">
                    <p>{t('Загрузка...', 'Loading...')}</p>
                </div>
            </TeacherLayout>
        );
    }

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

            {error && (
                <div className="teacher-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}
            {success && (
                <div className="teacher-empty" style={{ border: '1px solid #10B981', background: 'rgba(16,185,129,0.1)' }}>
                    <p style={{ color: '#10B981' }}>{success}</p>
                </div>
            )}

            <div className="teacher-grid teacher-grid-2">
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {t('Цены курсов', 'Course Pricing')}
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="teacher-label">{t('Выберите курс', 'Select Course')}</label>
                        <select
                            className="teacher-select"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            <option value="">{t('— Выберите курс —', '— Select Course —')}</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="teacher-label">{t('Базовая цена ($)', 'Base Price ($)')}</label>
                        <input
                            className="teacher-input"
                            type="number"
                            placeholder="29.99"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                        />
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
                        <input
                            className="teacher-input"
                            type="number"
                            placeholder={discountType === 'percent' ? '20' : '5'}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="teacher-label">{t('Бесплатный урок', 'Free Lesson')}</label>
                        <select
                            className="teacher-select"
                            value={freeLesson}
                            onChange={(e) => setFreeLesson(e.target.value)}
                        >
                            <option value="none">{t('Нет бесплатных уроков', 'No free lessons')}</option>
                            <option value="first">{t('Первый урок бесплатный', 'First lesson free')}</option>
                            <option value="multiple">{t('Несколько уроков', 'Multiple lessons')}</option>
                        </select>
                    </div>

                    <button
                        className="teacher-btn"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? t('Сохранение...', 'Saving...') : t('Сохранить цены', 'Save Pricing')}
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
                        <button className="teacher-btn" disabled>{t('Создать пакет', 'Create Bundle')}</button>
                    </div>
                </div>
            </div>

            <div className="teacher-card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Активные цены', 'Active Pricing')}
                </h3>
                {pricingList.length === 0 ? (
                    <div className="teacher-empty">
                        <p>{t('Установите цены для ваших курсов, чтобы они появились здесь', 'Set prices for your courses to see them here')}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pricingList.map((pricing, idx) => (
                            <div key={idx} style={{
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
                                        {pricing.courseTitle}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {pricing.discountValue ? `${pricing.discountType === 'percent' ? pricing.discountValue + '%' : '$' + pricing.discountValue} ${t('скидка', 'discount')}` : ''}
                                        {pricing.freeLesson !== 'none' ? ` • ${t('Бесплатный урок', 'Free lesson')}` : ''}
                                    </div>
                                </div>
                                <div style={{ fontWeight: '700', color: 'var(--accent-secondary)', fontSize: '18px' }}>
                                    ${pricing.basePrice?.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
