import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { uploadResource, getResourcesByTeacher } from '../../services/firestore';

export default function TeacherResources() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('upload');

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!userProfile?.uid) return;

        async function loadData() {
            try {
                setLoading(true);
                const data = await getResourcesByTeacher(userProfile.uid);
                setResources(data);
            } catch (error) {
                console.error('[TeacherResources] Error loading:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [userProfile?.uid]);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
            if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)) {
                setUploadError(language === 'ru' ? 'Неподдерживаемый формат файла' : 'Unsupported file format');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setUploadError(language === 'ru' ? 'Файл слишком большой (макс. 50MB)' : 'File too large (max 50MB)');
                return;
            }
            setSelectedFile(file);
            setUploadError('');
        }
    };

    const handlePublish = async () => {
        if (!selectedFile || !title) {
            setUploadError(language === 'ru' ? 'Выберите файл и введите название' : 'Select a file and enter a title');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadSuccess(false);

        try {
            await uploadResource(selectedFile, userProfile.uid, {
                title,
                category,
                description,
                price: price ? parseFloat(price) : 0,
                subject: category,
            });

            const data = await getResourcesByTeacher(userProfile.uid);
            setResources(data);

            setTitle('');
            setCategory('');
            setPrice('');
            setDescription('');
            setSelectedFile(null);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            console.error('[TeacherResources] Upload error:', error);
            setUploadError(error.message || (language === 'ru' ? 'Ошибка загрузки' : 'Upload failed'));
        } finally {
            setUploading(false);
        }
    };

    const deleteResource = async (resourceId, storagePath) => {
        try {
            const { deleteDocument, deleteFile } = await import('../../services/firestore');
            await deleteDocument('resources', resourceId);
            if (storagePath) await deleteFile(storagePath);
            setResources(prev => prev.filter(r => r.id !== resourceId));
        } catch (error) {
            console.error('[TeacherResources] Delete error:', error);
        }
    };

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
                            {t('Продавайте PDF, рабочие тетради и материалы', 'Sell PDFs, workbooks, study guides, and materials')}
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

                        {uploadError && <div className="teacher-error">{uploadError}</div>}
                        {uploadSuccess && (
                            <div className="teacher-success">
                                {language === 'ru' ? 'Ресурс опубликован!' : 'Resource published!'}
                            </div>
                        )}

                        <div
                            className={`teacher-upload-area ${selectedFile ? 'has-file' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedFile ? (
                                <>
                                    <svg className="teacher-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    <h4>{selectedFile.name}</h4>
                                    <p>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </>
                            ) : (
                                <>
                                    <svg className="teacher-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <h4>{t('Перетащите файл сюда', 'Drag file here')}</h4>
                                    <p>{t('PDF, DOC, DOCX, XLS, PPTX (макс. 50MB)', 'PDF, DOC, DOCX, XLS, PPTX (max 50MB)')}</p>
                                </>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" style={{ display: 'none' }} onChange={handleFileSelect} />

                        <div style={{ marginTop: '20px' }}>
                            <label className="teacher-label">{t('Название', 'Title')}</label>
                            <input className="teacher-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('Название ресурса...', 'Resource title...')} />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Описание', 'Description')}</label>
                            <textarea className="teacher-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('Описание ресурса...', 'Resource description...')} />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Категория', 'Category')}</label>
                            <select className="teacher-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="">{t('Выберите категорию...', 'Select category...')}</option>
                                <option value="pdf">{t('PDF книга', 'PDF Book')}</option>
                                <option value="workbook">{t('Рабочая тетрадь', 'Workbook')}</option>
                                <option value="guide">{t('Учебное пособие', 'Study Guide')}</option>
                                <option value="template">{t('Шаблон', 'Template')}</option>
                                <option value="practice">{t('Практические задания', 'Practice Sheets')}</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Цена ($)', 'Price ($)')}</label>
                            <input className="teacher-input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9.99" min="0" step="0.01" />
                        </div>
                        <button
                            className="teacher-btn primary"
                            style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
                            onClick={handlePublish}
                            disabled={uploading || !selectedFile || !title}
                        >
                            {uploading ? (language === 'ru' ? 'Загрузка...' : 'Uploading...') : t('Опубликовать', 'Publish')}
                        </button>
                    </div>

                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Мои ресурсы', 'My Resources')} ({resources.length})
                        </h3>
                        {loading ? (
                            <div className="teacher-loading"><div className="loading-spinner"></div></div>
                        ) : resources.length > 0 ? (
                            <div className="resource-list">
                                {resources.map(resource => (
                                    <div key={resource.id} className="resource-item">
                                        <div className="resource-item-info">
                                            <h4>{resource.title}</h4>
                                            <p>{resource.category} · {(resource.fileSize / (1024 * 1024)).toFixed(1)} MB</p>
                                            <span className="resource-price">${resource.price || 0}</span>
                                        </div>
                                        <div className="resource-item-actions">
                                            <a href={resource.fileURL} target="_blank" rel="noopener noreferrer" className="video-btn view">
                                                {t('Скачать', 'Download')}
                                            </a>
                                            <button className="video-btn delete" onClick={() => deleteResource(resource.id, resource.storagePath)}>
                                                {t('Удалить', 'Delete')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="teacher-empty">
                                <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                </svg>
                                <h3>{t('Нет загруженных ресурсов', 'No uploaded resources')}</h3>
                                <p>{t('Ваши ресурсы появятся здесь после загрузки', 'Your resources will appear here after upload')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'store' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Все ресурсы', 'All Resources')}
                    </h3>
                    {resources.length > 0 ? (
                        <div className="resource-grid">
                            {resources.map(resource => (
                                <div key={resource.id} className="resource-card">
                                    <div className="resource-card-icon">📄</div>
                                    <h4>{resource.title}</h4>
                                    <p>{resource.description?.substring(0, 80)}</p>
                                    <div className="resource-card-footer">
                                        <span className="resource-price">${resource.price || 0}</span>
                                        <a href={resource.fileURL} target="_blank" rel="noopener noreferrer" className="teacher-btn primary" style={{ fontSize: 12, padding: '6px 12px' }}>
                                            {t('Скачать', 'Download')}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <p>{t('Загрузите ресурсы, чтобы они появились в магазине', 'Upload resources to see them in the store')}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'manage' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Управление ресурсами', 'Resource Management')}
                    </h3>
                    {resources.length > 0 ? (
                        <div className="video-manage-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('Название', 'Title')}</th>
                                        <th>{t('Категория', 'Category')}</th>
                                        <th>{t('Цена', 'Price')}</th>
                                        <th>{t('Загрузки', 'Downloads')}</th>
                                        <th>{t('Действия', 'Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resources.map(resource => (
                                        <tr key={resource.id}>
                                            <td>{resource.title}</td>
                                            <td>{resource.category}</td>
                                            <td>${resource.price || 0}</td>
                                            <td>{resource.downloads || 0}</td>
                                            <td>
                                                <a href={resource.fileURL} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>{t('Открыть', 'Open')}</a>
                                                <button onClick={() => deleteResource(resource.id, resource.storagePath)} style={{ color: '#EF4444' }}>{t('Удалить', 'Delete')}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <p>{t('Нет ресурсов для управления', 'No resources to manage')}</p>
                        </div>
                    )}
                </div>
            )}
        </TeacherLayout>
    );
}
