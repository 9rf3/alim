import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { getAllResources } from '../../services/firestore';

export default function CabinetLibrary() {
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadResources = async () => {
            try {
                const allResources = await getAllResources();
                if (!isMounted) return;
                setResources(allResources);
            } catch (err) {
                console.error('[CabinetLibrary] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки ресурсов', 'Error loading resources'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadResources();
        return () => { isMounted = false; };
    }, [t]);

    const categories = [
        { id: 'all', label: t('Все', 'All') },
        { id: 'textbook', label: t('Учебники', 'Textbooks') },
        { id: 'worksheet', label: t('Рабочие тетради', 'Worksheets') },
        { id: 'pdf', label: t('PDF материалы', 'PDF Materials') },
        { id: 'notes', label: t('Заметки', 'Notes') },
    ];

    const filteredResources = resources.filter(r => {
        const matchesCategory = activeCategory === 'all' || r.type === activeCategory;
        const matchesSearch = !searchQuery ||
            (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.subject && r.subject.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header">
                    <h1>{t('Библиотека', 'Library')}</h1>
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
                        <h1>{t('Библиотека', 'Library')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Учебники, заметки и образовательные ресурсы', 'Textbooks, notes, and educational resources')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="cabinet-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}

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
                        className="cabinet-input"
                        style={{ paddingLeft: '40px' }}
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

            {filteredResources.length === 0 ? (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <h3>{t('Ресурсы не найдены', 'No resources found')}</h3>
                        <p>{t('Попробуйте изменить фильтры или поисковый запрос', 'Try changing filters or search query')}</p>
                    </div>
                </div>
            ) : (
                <div className="cabinet-grid cabinet-grid-3">
                    {filteredResources.map((resource) => (
                        <div key={resource.id} className="cabinet-card clickable">
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#3B82F6',
                                }}>
                                    {resource.type || t('Ресурс', 'Resource')}
                                </span>
                                {resource.subject && (
                                    <span style={{
                                        padding: '4px 8px',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: '#8B5CF6',
                                        marginLeft: '8px',
                                    }}>
                                        {resource.subject}
                                    </span>
                                )}
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {resource.title}
                            </h4>
                            {resource.description && (
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    {resource.description}
                                </p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {resource.downloads || 0} {t('скачиваний', 'downloads')}
                                </span>
                                {resource.fileSize && (
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        • {(resource.fileSize / 1024 / 1024).toFixed(1)} MB
                                    </span>
                                )}
                            </div>
                            <a
                                href={resource.fileURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cabinet-btn"
                                style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '8px', textDecoration: 'none' }}
                            >
                                {t('Скачать', 'Download')}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </CabinetLayout>
    );
}
