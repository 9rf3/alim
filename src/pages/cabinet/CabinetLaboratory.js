import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import { getPublishedProjects, getProjectsByStudent, orderProject } from '../../services/firestore';

export default function CabinetLaboratory() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('projects');

    const [publishedProjects, setPublishedProjects] = useState([]);
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const [published, my] = await Promise.all([
                    getPublishedProjects(),
                    getProjectsByStudent(userProfile.uid),
                ]);
                if (!isMounted) return;
                setPublishedProjects(published);
                setMyProjects(my);
            } catch (err) {
                console.error('[CabinetLaboratory] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки проектов', 'Error loading projects'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const handleOrder = async (project) => {
        if (!userProfile?.uid) return;
        setOrdering(project.id);
        setError('');
        setSuccess('');
        try {
            await orderProject(project.id, userProfile.uid);
            setSuccess(t('Проект заказан! Ожидайте выполнения', 'Project ordered! Await completion'));
        } catch (err) {
            console.error('[CabinetLaboratory] Order error:', err);
            setError(err.message || t('Ошибка заказа проекта', 'Error ordering project'));
        } finally {
            setOrdering(null);
        }
    };

    const tabs = [
        { id: 'projects', label: t('Мои проекты', 'My Projects') },
        { id: 'catalog', label: t('Каталог', 'Catalog') },
    ];

    if (loading) {
        return (
            <CabinetLayout>
                <div className="cabinet-header">
                    <h1>{t('Лаборатория', 'Laboratory')}</h1>
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
                        <h1>{t('Лаборатория', 'Laboratory')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Заказывайте проекты и отслеживайте выполнение', 'Order projects and track completion')}
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

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                {tabs.map((tab) => (
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

            {activeTab === 'projects' && (
                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Мои заказы', 'My Orders')}
                    </h3>
                    {myProjects.length === 0 ? (
                        <div className="cabinet-empty">
                            <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/>
                                <path d="M6 8H18"/>
                            </svg>
                            <h3>{t('У вас пока нет заказов', 'You have no orders yet')}</h3>
                            <p>{t('Перейдите в каталог, чтобы заказать проект', 'Go to catalog to order a project')}</p>
                            <button className="cabinet-btn" onClick={() => setActiveTab('catalog')}>
                                {t('Открыть каталог', 'Open Catalog')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myProjects.map((project) => (
                                <div key={project.id} style={{
                                    padding: '16px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                                {project.title}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                {project.subject} • {project.price > 0 ? `$${project.price.toFixed(2)}` : t('Бесплатно', 'Free')}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: project.status === 'in_progress' ? 'rgba(59, 130, 246, 0.15)' : project.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                            color: project.status === 'in_progress' ? '#3B82F6' : project.status === 'completed' ? '#10B981' : '#F59E0B',
                                        }}>
                                            {project.status === 'in_progress' ? t('В работе', 'In Progress') : project.status === 'completed' ? t('Завершён', 'Completed') : t('Ожидает', 'Pending')}
                                        </span>
                                    </div>
                                    {project.description && (
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'catalog' && (
                <div>
                    {publishedProjects.length === 0 ? (
                        <div className="cabinet-card">
                            <div className="cabinet-empty">
                                <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                                <h3>{t('Каталог пуст', 'Catalog is empty')}</h3>
                                <p>{t('Преподаватели ещё не опубликовали проекты', 'Teachers have not published projects yet')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="cabinet-grid cabinet-grid-3">
                            {publishedProjects.map((project) => (
                                <div key={project.id} className="cabinet-card">
                                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                        {project.title}
                                    </h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        {project.subject}
                                    </p>
                                    {project.description && (
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                            {project.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                                            {project.price > 0 ? `$${project.price.toFixed(2)}` : t('Бесплатно', 'Free')}
                                        </span>
                                    </div>
                                    <button
                                        className="cabinet-btn"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        onClick={() => handleOrder(project)}
                                        disabled={ordering === project.id}
                                    >
                                        {ordering === project.id ? t('Заказ...', 'Ordering...') : t('Заказать', 'Order')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </CabinetLayout>
    );
}
