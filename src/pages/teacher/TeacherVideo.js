import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { uploadVideoResumable, getVideosByTeacher, getCoursesByTeacher, createCourse } from '../../services/firestore';

export default function TeacherVideo() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('upload');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [subject, setSubject] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const [videos, setVideos] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateCourse, setShowCreateCourse] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseDesc, setNewCourseDesc] = useState('');

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const [videosData, coursesData] = await Promise.all([
                    getVideosByTeacher(userProfile.uid),
                    getCoursesByTeacher(userProfile.uid),
                ]);
                if (!isMounted) return;
                setVideos(videosData);
                setCourses(coursesData);
            } catch (error) {
                console.error('[TeacherVideo] Error loading data:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [userProfile?.uid]);

    const refreshData = async () => {
        if (!userProfile?.uid) return;
        try {
            const [videosData, coursesData] = await Promise.all([
                getVideosByTeacher(userProfile.uid),
                getCoursesByTeacher(userProfile.uid),
            ]);
            setVideos(videosData);
            setCourses(coursesData);
        } catch (error) {
            console.error('[TeacherVideo] Refresh error:', error);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                setUploadError(language === 'ru' ? 'Выберите видеофайл' : 'Please select a video file');
                return;
            }
            if (file.size > 500 * 1024 * 1024) {
                setUploadError(language === 'ru' ? 'Файл слишком большой (макс. 500MB)' : 'File too large (max 500MB)');
                return;
            }
            setSelectedFile(file);
            setUploadError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !title) {
            setUploadError(language === 'ru' ? 'Выберите файл и введите название' : 'Select a file and enter a title');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadSuccess(false);
        setUploadProgress(0);

        try {
            console.log('[TeacherVideo] Starting upload:', { fileName: selectedFile.name, size: selectedFile.size, title });

            await uploadVideoResumable(
                selectedFile,
                userProfile.uid,
                selectedCourse || 'uncategorized',
                {
                    title,
                    description,
                    subject,
                    privacy,
                    courseId: selectedCourse,
                },
                (progress) => {
                    console.log('[TeacherVideo] Upload progress:', progress + '%');
                    setUploadProgress(progress);
                }
            );

            setUploadProgress(100);
            console.log('[TeacherVideo] Upload complete, refreshing videos list');

            await refreshData();

            setTitle('');
            setDescription('');
            setSelectedCourse('');
            setSubject('');
            setSelectedFile(null);
            setUploadSuccess(true);

            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            console.error('[TeacherVideo] Upload error:', error);
            setUploadError(error.message || (language === 'ru' ? 'Ошибка загрузки видео' : 'Failed to upload video'));
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 2000);
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseTitle) return;

        try {
            const newCourse = await createCourse(userProfile.uid, {
                title: newCourseTitle,
                description: newCourseDesc,
                subject,
            });
            setCourses(prev => [...prev, newCourse]);
            setShowCreateCourse(false);
            setNewCourseTitle('');
            setNewCourseDesc('');
        } catch (error) {
            console.error('[TeacherVideo] Create course error:', error);
            setUploadError(error.message || (language === 'ru' ? 'Ошибка создания курса' : 'Failed to create course'));
        }
    };

    const deleteVideo = async (videoId, storagePath) => {
        try {
            const { deleteDocument, deleteFile } = await import('../../services/firestore');
            await deleteDocument('videos', videoId);
            if (storagePath) {
                await deleteFile(storagePath);
            }
            setVideos(prev => prev.filter(v => v.id !== videoId));
        } catch (error) {
            console.error('[TeacherVideo] Delete error:', error);
        }
    };

    const tabs = [
        { id: 'upload', label: t('Загрузить видео', 'Upload Video') },
        { id: 'courses', label: t('Мои курсы', 'My Courses') },
        { id: 'manage', label: t('Управление', 'Manage') },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Видео система', 'Video System')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Загружайте уроки, создавайте курсы', 'Upload lessons, create courses')}
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

                        {uploadError && (
                            <div className="teacher-error">{uploadError}</div>
                        )}
                        {uploadSuccess && (
                            <div className="teacher-success">
                                {language === 'ru' ? 'Видео успешно загружено!' : 'Video uploaded successfully!'}
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
                                    <h4>{t('Перетащите видео сюда', 'Drag video here')}</h4>
                                    <p>{t('или нажмите для выбора файла', 'or click to select file')}</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />

                        {uploading && (
                            <div className="upload-progress-bar">
                                <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                <span>{uploadProgress}%</span>
                            </div>
                        )}

                        <div style={{ marginTop: '20px' }}>
                            <label className="teacher-label">{t('Название урока', 'Lesson Title')}</label>
                            <input
                                className="teacher-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('Введите название...', 'Enter title...')}
                            />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Описание', 'Description')}</label>
                            <textarea
                                className="teacher-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('Опишите содержание урока...', 'Describe the lesson content...')}
                            />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Курс', 'Course')}</label>
                            <select
                                className="teacher-select"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">{t('Выберите курс...', 'Select course...')}</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <button
                                className="teacher-link-btn"
                                onClick={() => setShowCreateCourse(!showCreateCourse)}
                            >
                                {t('+ Создать новый курс', '+ Create new course')}
                            </button>
                        </div>

                        {showCreateCourse && (
                            <div className="teacher-card" style={{ marginTop: 16, background: 'var(--bg-tertiary)' }}>
                                <h4 style={{ marginBottom: 12 }}>{t('Новый курс', 'New Course')}</h4>
                                <input
                                    className="teacher-input"
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                    placeholder={t('Название курса', 'Course title')}
                                    style={{ marginBottom: 12 }}
                                />
                                <textarea
                                    className="teacher-textarea"
                                    value={newCourseDesc}
                                    onChange={(e) => setNewCourseDesc(e.target.value)}
                                    placeholder={t('Описание курса', 'Course description')}
                                    style={{ marginBottom: 12 }}
                                />
                                <button className="teacher-btn primary" onClick={handleCreateCourse}>
                                    {t('Создать', 'Create')}
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Предмет', 'Subject')}</label>
                            <select className="teacher-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                                <option value="">{t('Выберите предмет...', 'Select subject...')}</option>
                                <option value="math">Mathematics</option>
                                <option value="physics">Physics</option>
                                <option value="chemistry">Chemistry</option>
                                <option value="biology">Biology</option>
                                <option value="english">English</option>
                                <option value="programming">Programming</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className="teacher-label">{t('Приватность', 'Privacy')}</label>
                            <select className="teacher-select" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                                <option value="public">{t('Публичный', 'Public')}</option>
                                <option value="students">{t('Только для студентов', 'Students Only')}</option>
                                <option value="private">{t('Приватный', 'Private')}</option>
                            </select>
                        </div>
                        <button
                            className="teacher-btn primary"
                            style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
                            onClick={handleUpload}
                            disabled={uploading || !selectedFile || !title}
                        >
                            {uploading
                                ? (language === 'ru' ? 'Загрузка...' : 'Uploading...')
                                : t('Загрузить видео', 'Upload Video')}
                        </button>
                    </div>

                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Мои видео', 'My Videos')} ({videos.length})
                        </h3>
                        {loading ? (
                            <div className="teacher-loading"><div className="loading-spinner"></div></div>
                        ) : videos.length > 0 ? (
                            <div className="video-list">
                                {videos.map(video => (
                                    <div key={video.id} className="video-item">
                                        <div className="video-item-info">
                                            <h4>{video.title}</h4>
                                            <p>{video.description?.substring(0, 80)}...</p>
                                            <span className="video-meta">
                                                {video.subject} · {video.privacy}
                                            </span>
                                        </div>
                                        <div className="video-item-actions">
                                            <a href={video.videoURL} target="_blank" rel="noopener noreferrer" className="video-btn view">
                                                {t('Смотреть', 'View')}
                                            </a>
                                            <button
                                                className="video-btn delete"
                                                onClick={() => deleteVideo(video.id, video.storagePath)}
                                            >
                                                {t('Удалить', 'Delete')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="teacher-empty">
                                <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                </svg>
                                <h3>{t('Нет загруженных видео', 'No uploaded videos')}</h3>
                                <p>{t('Ваши видео появятся здесь после загрузки', 'Your videos will appear here after upload')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'courses' && (
                <div className="teacher-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {t('Мои курсы', 'My Courses')} ({courses.length})
                        </h3>
                        <button className="teacher-btn primary" onClick={() => setShowCreateCourse(!showCreateCourse)}>
                            {t('+ Новый курс', '+ New Course')}
                        </button>
                    </div>

                    {courses.length > 0 ? (
                        <div className="courses-grid">
                            {courses.map(course => (
                                <div key={course.id} className="course-card">
                                    <h4>{course.title}</h4>
                                    <p>{course.description?.substring(0, 100)}</p>
                                    <div className="course-meta">
                                        <span>{course.studentCount || 0} students</span>
                                        <span>{course.lessonCount || 0} lessons</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                            <h3>{t('Нет созданных курсов', 'No courses created')}</h3>
                            <p>{t('Создайте свой первый курс с видеоуроками', 'Create your first course with video lessons')}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'manage' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Управление видео', 'Video Management')}
                    </h3>
                    {videos.length > 0 ? (
                        <div className="video-manage-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('Название', 'Title')}</th>
                                        <th>{t('Курс', 'Course')}</th>
                                        <th>{t('Просмотры', 'Views')}</th>
                                        <th>{t('Действия', 'Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {videos.map(video => (
                                        <tr key={video.id}>
                                            <td>{video.title}</td>
                                            <td>{video.courseId || '—'}</td>
                                            <td>{video.views || 0}</td>
                                            <td>
                                                <a href={video.videoURL} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
                                                    {t('Открыть', 'Open')}
                                                </a>
                                                <button
                                                    onClick={() => deleteVideo(video.id, video.storagePath)}
                                                    style={{ color: '#EF4444' }}
                                                >
                                                    {t('Удалить', 'Delete')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <p>{t('Нет видео для управления', 'No videos to manage')}</p>
                        </div>
                    )}
                </div>
            )}
        </TeacherLayout>
    );
}
