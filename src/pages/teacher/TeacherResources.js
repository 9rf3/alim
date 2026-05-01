import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherResources() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('upload');

    const tabs = [
        { id: 'upload', label: t('Загрузить', 'Upload') },
        { id: 'store', label: t('Магазин', 'Store') },
        { id: 'manage', label: t('Управление', 'Manage') },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Магазин ресурсов', 'Resource Store')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Продавайте PDF, рабочие тетради, учебные пособия и материалы', 'Sell PDFs, workbooks, study guides, and materials')}
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
                            {t('Загрузить ресурс', 'Upload Resource')}
                        </h3>
                        <div className="teacher-upload-area">
                            <svg className="teacher-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <h4>{t('Перетащите файл сюда', 'Drag file here')}</h4>
                            <p>{t('PDF, DOC, DOCX, XLS, PPTX (макс. 50MB)', 'PDF, DOC, DOCX, XLS, PPTX (max 50MB)')}</p>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label className="teacher-label">{t('Название', 'Title')}</label>
                            <input className="teacher-input" placeholder={t('Название ресурса...', 'Resource title...')} />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Категория', 'Category')}</label>
                            <select className="teacher-select">
                                <option>{t('Выберите категорию...', 'Select category...')}</option>
                                <option>{t('PDF книга', 'PDF Book')}</option>
                                <option>{t('Рабочая тетрадь', 'Workbook')}</option>
                                <option>{t('Учебное пособие', 'Study Guide')}</option>
                                <option>{t('Шаблон', 'Template')}</option>
                                <option>{t('Практические задания', 'Practice Sheets')}</option>
                                <option>{t('Набор ресурсов', 'Resource Pack')}</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Цена ($)', 'Price ($)')}</label>
                            <input className="teacher-input" type="number" placeholder="9.99" />
                        </div>
                        <button className="teacher-btn" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                            {t('Опубликовать', 'Publish')}
                        </button>
                    </div>

                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Мои ресурсы', 'My Resources')}
                        </h3>
                        <div className="teacher-empty">
                            <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                            <h3>{t('Нет загруженных ресурсов', 'No uploaded resources')}</h3>
                            <p>{t('Ваши ресурсы появятся здесь после загрузки', 'Your resources will appear here after upload')}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'store' && (
                <div className="teacher-card">
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <h3>{t('Магазин ресурсов', 'Resource Store')}</h3>
                        <p>{t('Загрузите ресурсы, чтобы они появились в магазине', 'Upload resources to see them in the store')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'manage' && (
                <div className="teacher-card">
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <h3>{t('Управление ресурсами', 'Resource Management')}</h3>
                        <p>{t('Редактируйте цены, описания и файлы', 'Edit prices, descriptions, and files')}</p>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
