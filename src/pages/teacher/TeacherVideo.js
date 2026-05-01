import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherVideo() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('upload');

    const tabs = [
        { id: 'upload', label: t('Загрузить видео', 'Upload Video') },
        { id: 'courses', label: t('Мои курсы', 'My Courses') },
        { id: 'playlists', label: t('Плейлисты', 'Playlists') },
        { id: 'manage', label: t('Управление', 'Manage') },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Видео система', 'Video System')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Загружайте уроки, создавайте курсы и плейлисты', 'Upload lessons, create courses and playlists')}
                        </p>
                    </div>
                </div>
            </div>

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

            {activeTab === 'upload' && (
                <div className="teacher-grid teacher-grid-2">
                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Загрузить видео', 'Upload Video')}
                        </h3>
                        <div className="teacher-upload-area">
                            <svg className="teacher-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <h4>{t('Перетащите видео сюда', 'Drag video here')}</h4>
                            <p>{t('или нажмите для выбора файла', 'or click to select file')}</p>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label className="teacher-label">{t('Название урока', 'Lesson Title')}</label>
                            <input className="teacher-input" placeholder={t('Введите название...', 'Enter title...')} />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Описание', 'Description')}</label>
                            <textarea className="teacher-textarea" placeholder={t('Опишите содержание урока...', 'Describe the lesson content...')} />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Курс', 'Course')}</label>
                            <select className="teacher-select">
                                <option>{t('Выберите курс...', 'Select course...')}</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Приватность', 'Privacy')}</label>
                            <select className="teacher-select">
                                <option>{t('Публичный', 'Public')}</option>
                                <option>{t('Только для студентов', 'Students Only')}</option>
                                <option>{t('Приватный', 'Private')}</option>
                            </select>
                        </div>
                        <button className="teacher-btn" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                            {t('Загрузить видео', 'Upload Video')}
                        </button>
                    </div>

                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Последние загрузки', 'Recent Uploads')}
                        </h3>
                        <div className="teacher-empty">
                            <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                            <h3>{t('Нет загруженных видео', 'No uploaded videos')}</h3>
                            <p>{t('Ваши видео появятся здесь после загрузки', 'Your videos will appear here after upload')}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'courses' && (
                <div className="teacher-card">
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <h3>{t('Нет созданных курсов', 'No courses created')}</h3>
                        <p>{t('Создайте свой первый курс с видеоуроками', 'Create your first course with video lessons')}</p>
                        <button className="teacher-btn">{t('Создать курс', 'Create Course')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'playlists' && (
                <div className="teacher-card">
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                        <h3>{t('Нет плейлистов', 'No playlists')}</h3>
                        <p>{t('Создавайте плейлисты для организации уроков', 'Create playlists to organize lessons')}</p>
                        <button className="teacher-btn">{t('Создать плейлист', 'Create Playlist')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'manage' && (
                <div className="teacher-card">
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        <h3>{t('Управление видео', 'Video Management')}</h3>
                        <p>{t('Редактируйте, удаляйте и управляйте вашими видео', 'Edit, delete, and manage your videos')}</p>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
