import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { getMarketplaceListings, getListingsByUser, createMarketplaceListing, updateListingStatus, deleteMarketplaceListing } from '../../services/firestore';

export default function CabinetMarketplace() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const [activeTab, setActiveTab] = useState('buy');

    const [listings, setListings] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'project',
        price: '',
        subject: '',
    });

    const refreshData = async () => {
        if (!userProfile?.uid) return;
        try {
            const [allListings, user] = await Promise.all([
                getMarketplaceListings(),
                getListingsByUser(userProfile.uid),
            ]);
            setListings(allListings);
            setMyListings(user);
        } catch (err) {
            console.error('[CabinetMarketplace] Refresh error:', err);
        }
    };

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const [allListings, user] = await Promise.all([
                    getMarketplaceListings(),
                    getListingsByUser(userProfile.uid),
                ]);
                if (!isMounted) return;
                setListings(allListings);
                setMyListings(user);
            } catch (err) {
                console.error('[CabinetMarketplace] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки предложений', 'Error loading listings'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const handleCreateListing = async () => {
        if (!userProfile?.uid || !formData.title || !formData.price) {
            setError(t('Заполните название и цену', 'Fill in title and price'));
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await createMarketplaceListing(userProfile.uid, {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                price: parseFloat(formData.price),
                subject: formData.subject,
            });
            setSuccess(t('Предложение создано!', 'Listing created!'));
            setFormData({ title: '', description: '', type: 'project', price: '', subject: '' });
            await refreshData();
        } catch (err) {
            setError(t('Ошибка создания предложения', 'Error creating listing'));
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (listingId) => {
        setError('');
        setSuccess('');
        try {
            await updateListingStatus(listingId, 'inactive');
            setSuccess(t('Предложение деактивировано', 'Listing deactivated'));
            await refreshData();
        } catch (err) {
            setError(t('Ошибка деактивации', 'Error deactivating'));
            console.error(err);
        }
    };

    const handleDelete = async (listingId) => {
        setError('');
        setSuccess('');
        try {
            await deleteMarketplaceListing(listingId);
            setSuccess(t('Предложение удалено', 'Listing deleted'));
            await refreshData();
        } catch (err) {
            setError(t('Ошибка удаления', 'Error deleting'));
            console.error(err);
        }
    };

    const typeLabels = {
        project: t('Проект', 'Project'),
        template: t('Шаблон', 'Template'),
        notes: t('Заметки', 'Notes'),
        resource: t('Ресурс', 'Resource'),
    };

    const typeColors = {
        project: '#3B82F6',
        template: '#8B5CF6',
        notes: '#10B981',
        resource: '#F59E0B',
    };

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header">
                    <h1>{t('Торговля проектами', 'Project Trading')}</h1>
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
                        <h1>{t('Торговля проектами', 'Project Trading')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Покупайте, продавайте и обменивайтесь образовательными ресурсами', 'Buy, sell, and exchange educational resources')}
                        </p>
                    </div>
                    <div className="cabinet-header-actions">
                        <button className="cabinet-btn" onClick={() => setActiveTab('sell')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {t('Разместить', 'List Item')}
                        </button>
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
                    {listings.length === 0 ? (
                        <div className="cabinet-card">
                            <div className="cabinet-empty">
                                <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                </svg>
                                <h3>{t('Нет предложений', 'No listings')}</h3>
                                <p>{t('Будьте первым, кто разместит предложение!', 'Be the first to list an item!')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="cabinet-grid cabinet-grid-3">
                            {listings.filter(l => l.status === 'active').map((item) => (
                                <div key={item.id} className="cabinet-card">
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: `${typeColors[item.type] || '#3B82F6'}20`,
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: typeColors[item.type] || '#3B82F6',
                                        }}>
                                            {typeLabels[item.type] || item.type}
                                        </span>
                                        {item.subject && (
                                            <span style={{
                                                padding: '4px 8px',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#8B5CF6',
                                                marginLeft: '8px',
                                            }}>
                                                {item.subject}
                                            </span>
                                        )}
                                    </div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                        {item.title}
                                    </h4>
                                    {item.description && (
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                            {item.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                                            ${item.price?.toFixed(2)}
                                        </span>
                                    </div>
                                    <button className="cabinet-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
                                        {t('Купить', 'Buy')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'sell' && (
                <div className="cabinet-card" style={{ maxWidth: '600px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {t('Новое предложение', 'New Listing')}
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="cabinet-label">{t('Название', 'Title')}</label>
                        <input
                            className="cabinet-input"
                            type="text"
                            placeholder={t('Название проекта или ресурса', 'Project or resource title')}
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="cabinet-label">{t('Описание', 'Description')}</label>
                        <textarea
                            className="cabinet-input"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            placeholder={t('Описание вашего предложения', 'Description of your listing')}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="cabinet-label">{t('Тип', 'Type')}</label>
                            <select
                                className="cabinet-select"
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            >
                                <option value="project">{t('Проект', 'Project')}</option>
                                <option value="template">{t('Шаблон', 'Template')}</option>
                                <option value="notes">{t('Заметки', 'Notes')}</option>
                                <option value="resource">{t('Ресурс', 'Resource')}</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="cabinet-label">{t('Цена ($)', 'Price ($)')}</label>
                            <input
                                className="cabinet-input"
                                type="number"
                                placeholder="9.99"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="cabinet-label">{t('Предмет', 'Subject')}</label>
                        <input
                            className="cabinet-input"
                            type="text"
                            placeholder={t('Математика, Физика...', 'Math, Physics...')}
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        />
                    </div>

                    <button
                        className="cabinet-btn"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={handleCreateListing}
                        disabled={saving}
                    >
                        {saving ? t('Создание...', 'Creating...') : t('Разместить', 'List Item')}
                    </button>
                </div>
            )}

            {activeTab === 'my' && (
                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Мои предложения', 'My Listings')}
                    </h3>
                    {myListings.length === 0 ? (
                        <div className="cabinet-empty">
                            <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M4 12h16"/>
                            </svg>
                            <h3>{t('Нет активных предложений', 'No Active Listings')}</h3>
                            <p>{t('Ваши предложения появятся здесь', 'Your listings will appear here')}</p>
                            <button className="cabinet-btn" onClick={() => setActiveTab('sell')}>
                                {t('Разместить', 'List Item')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myListings.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            {typeLabels[item.type] || item.type} • ${item.price?.toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: item.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                            color: item.status === 'active' ? '#10B981' : '#6B7280',
                                        }}>
                                            {item.status === 'active' ? t('Активно', 'Active') : t('Неактивно', 'Inactive')}
                                        </span>
                                        {item.status === 'active' && (
                                            <button
                                                className="cabinet-btn secondary"
                                                style={{ padding: '4px 12px', fontSize: '12px' }}
                                                onClick={() => handleDeactivate(item.id)}
                                            >
                                                {t('Деактивировать', 'Deactivate')}
                                            </button>
                                        )}
                                        <button
                                            className="cabinet-btn secondary"
                                            style={{ padding: '4px 12px', fontSize: '12px', color: '#EF4444' }}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            {t('Удалить', 'Delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </CabinetLayout>
    );
}
