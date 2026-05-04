import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { createProject, getProjectsByTeacher, publishProject } from '../../services/firestore';

export default function TeacherLaboratory() {
    const { userProfile } = useAuth();
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const [activeTab, setActiveTab] = useState('publish');

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        price: '',
    });

    const refreshProjects = async () => {
        if (!userProfile?.uid) return;
        try {
            const teacherProjects = await getProjectsByTeacher(userProfile.uid);
            setProjects(teacherProjects);
        } catch (err) {
            console.error('[TeacherLaboratory] Refresh error:', err);
        }
    };

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadProjects = async () => {
            try {
                const teacherProjects = await getProjectsByTeacher(userProfile.uid);
                if (!isMounted) return;
                setProjects(teacherProjects);
            } catch (err) {
                console.error('[TeacherLaboratory] Error:', err);
                if (!isMounted) return;
                setError(err.message || t('Ошибка загрузки проектов', 'Error loading projects'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadProjects();
        return () => { isMounted = false; };
    }, [userProfile?.uid, t]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateProject = async () => {
        if (!formData.title || !formData.subject) {
            setError(t('Заполните название и предмет', 'Fill in title and subject'));
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await createProject(userProfile.uid, {
                title: formData.title,
                description: formData.description,
                subject: formData.subject,
                price: formData.price ? parseFloat(formData.price) : 0,
            });
            setSuccess(t('Проект создан!', 'Project created!'));
            setFormData({ title: '', description: '', subject: '', price: '' });
            await refreshProjects();
        } catch (err) {
            setError(t('Ошибка создания проекта', 'Error creating project'));
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (projectId) => {
        setError('');
        setSuccess('');
        try {
            await publishProject(projectId);
            setSuccess(t('Проект опубликован!', 'Project published!'));
            await refreshProjects();
        } catch (err) {
            setError(t('Ошибка публикации', 'Error publishing'));
            console.error(err);
        }
    };

    const tabs = [
        { id: 'orders', label: t('Заказы', 'Orders') },
        { id: 'examples', label: t('Примеры', 'Examples') },
        { id: 'publish', label: t('Публикация', 'Publish') },
    ];

    if (loading && activeTab === 'publish') {
        return (
            <TeacherLayout>
                <div className="teacher-header">
                    <h1>{t('Лаборатория учителя', 'Teacher Laboratory')}</h1>
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
                        <h1>{t('Лаборатория учителя', 'Teacher Laboratory')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Принимайте заказы, создавайте примеры и публикуйте проекты', 'Accept orders, create examples, and publish projects')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="teacher-empty" style={{ border: '1px solid #EF4444', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>
                    <p style={{ color: '#EF4444' }}>{error}</p>
                </div>
            )}
            {success && (
                <div className="teacher-empty" style={{ border: '1px solid #10B981', background: 'rgba(16,185,129,0.1)', marginBottom: '16px' }}>
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
                            background: activeTab === tab.id ? 'linear-gradient(135deg, var(--accent-secondary), #EF4444)' : 'transparent',
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

            {activeTab === 'orders' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Заказы от учеников', 'Student Orders')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3L7 17C7 18.6569 8.34315 20 10 20H14C15.6569 20 17 18.6569 17 17L15 3"/><path d="M6 8H18"/>
                        </svg>
                        <h3>{t('Нет заказов', 'No orders')}</h3>
                        <p>{t('Заказы от учеников на проекты появятся здесь', 'Student project orders will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'examples' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Образовательные примеры', 'Educational Examples')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"/><path d="M12 3c4.97 0 9 2.69 9 6s-4.03 6-9 6-9-2.69-9-6 4.03-6 9-6z"/>
                        </svg>
                        <h3>{t('Нет примеров', 'No examples')}</h3>
                        <p>{t('Создавайте демонстрации и симуляции для учеников', 'Create demonstrations and simulations for students')}</p>
                        <button className="teacher-btn" disabled>{t('Создать пример', 'Create Example')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'publish' && (
                <>
                    <div className="teacher-card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                            {t('Создать проект', 'Create Project')}
                        </h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Название', 'Title')}</label>
                            <input
                                className="teacher-input"
                                type="text"
                                placeholder={t('Название проекта', 'Project title')}
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Описание', 'Description')}</label>
                            <textarea
                                className="teacher-input"
                                style={{ minHeight: '80px', resize: 'vertical' }}
                                placeholder={t('Описание проекта', 'Project description')}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Предмет', 'Subject')}</label>
                            <input
                                className="teacher-input"
                                type="text"
                                placeholder={t('Математика, Физика...', 'Math, Physics...')}
                                value={formData.subject}
                                onChange={(e) => handleInputChange('subject', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Цена ($)', 'Price ($)')}</label>
                            <input
                                className="teacher-input"
                                type="number"
                                placeholder="0"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                            />
                        </div>

                        <button
                            className="teacher-btn"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={handleCreateProject}
                            disabled={saving}
                        >
                            {saving ? t('Создание...', 'Creating...') : t('Создать проект', 'Create Project')}
                        </button>
                    </div>

                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Мои проекты', 'My Projects')}
                        </h3>
                        {projects.length === 0 ? (
                            <div className="teacher-empty">
                                <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <h3>{t('Нет проектов', 'No projects')}</h3>
                                <p>{t('Создайте свой первый проект', 'Create your first project')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {projects.map((project) => (
                                    <div key={project.id} style={{
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
                                                {project.title}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                {project.subject} • {project.status === 'published' ? t('Опубликован', 'Published') : t('Черновик', 'Draft')}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {project.price > 0 && (
                                                <span style={{ fontWeight: '600', color: 'var(--accent-secondary)', fontSize: '14px' }}>
                                                    ${project.price?.toFixed(2)}
                                                </span>
                                            )}
                                            {project.status !== 'published' && (
                                                <button
                                                    className="teacher-btn"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    onClick={() => handlePublish(project.id)}
                                                >
                                                    {t('Опубликовать', 'Publish')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </TeacherLayout>
    );
}
