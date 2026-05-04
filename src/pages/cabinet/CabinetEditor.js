import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import {
    getAllVideos,
    getAllResources,
    getAllQuizzes,
    getQuiz,
    submitQuizAttempt,
    getQuizAttemptsByUser,
    createNote,
    getNotesByUser,
    updateNote,
    deleteNote,
    updateVideoProgress,
    getProgressByUser,
} from '../../services/firestore';

export default function CabinetEditor() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('lessons');

    // --- LESSONS STATE ---
    const [videos, setVideos] = useState([]);
    const [videoProgress, setVideoProgress] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // --- RESOURCES STATE ---
    const [resources, setResources] = useState([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);

    // --- QUIZZES STATE ---
    const [quizzes, setQuizzes] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [quizzesLoading, setQuizzesLoading] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitting, setQuizSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    // --- NOTES STATE ---
    const [notes, setNotes] = useState([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [noteTitle, setNoteTitle] = useState('');
    const [noteSaving, setNoteSaving] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);

    // --- GLOBAL ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- LOAD DATA WHEN TAB CHANGES ---
    useEffect(() => {
        let isMounted = true;

        if (activeTab === 'lessons') {
            (async () => {
                if (!userProfile?.uid) return;
                setVideosLoading(true);
                try {
                    const [vids, prog] = await Promise.all([
                        getAllVideos(),
                        getProgressByUser(userProfile.uid),
                    ]);
                    if (!isMounted) return;
                    setVideos(vids);
                    setVideoProgress(prog);
                } catch (err) {
                    console.error('[CabinetEditor] Error loading videos:', err);
                } finally {
                    if (isMounted) setVideosLoading(false);
                }
            })();
        }
        if (activeTab === 'resources') {
            (async () => {
                setResourcesLoading(true);
                try {
                    const res = await getAllResources();
                    if (!isMounted) return;
                    setResources(res);
                } catch (err) {
                    console.error('[CabinetEditor] Error loading resources:', err);
                } finally {
                    if (isMounted) setResourcesLoading(false);
                }
            })();
        }
        if (activeTab === 'quizzes') {
            (async () => {
                if (!userProfile?.uid) return;
                setQuizzesLoading(true);
                try {
                    const [allQuizzes, attempts] = await Promise.all([
                        getAllQuizzes(),
                        getQuizAttemptsByUser(userProfile.uid),
                    ]);
                    if (!isMounted) return;
                    setQuizzes(allQuizzes);
                    setQuizAttempts(attempts);
                } catch (err) {
                    console.error('[CabinetEditor] Error loading quizzes:', err);
                } finally {
                    if (isMounted) setQuizzesLoading(false);
                }
            })();
        }
        if (activeTab === 'notes') {
            (async () => {
                if (!userProfile?.uid) return;
                setNotesLoading(true);
                try {
                    const n = await getNotesByUser(userProfile.uid);
                    if (!isMounted) return;
                    setNotes(n);
                } catch (err) {
                    console.error('[CabinetEditor] Error loading notes:', err);
                } finally {
                    if (isMounted) setNotesLoading(false);
                }
            })();
        }

        return () => { isMounted = false; };
    }, [activeTab, userProfile?.uid]);

    const refreshNotes = async () => {
        if (!userProfile?.uid) return;
        try {
            const n = await getNotesByUser(userProfile.uid);
            setNotes(n);
        } catch (err) {
            console.error('[CabinetEditor] Refresh notes error:', err);
        }
    };

    // --- VIDEO HANDLERS ---
    const handleStartVideo = (video) => {
        setSelectedVideo(video);
    };

    const handleVideoProgress = async (videoId, progress) => {
        if (!userProfile?.uid) return;
        try {
            await updateVideoProgress(videoId, userProfile.uid, progress);
            setVideoProgress(prev => {
                const existing = prev.find(p => p.videoId === videoId);
                if (existing) return prev.map(p => p.videoId === videoId ? { ...p, progress } : p);
                return [...prev, { videoId, progress, userId: userProfile.uid }];
            });
        } catch (err) {
            console.error('[CabinetEditor] Error saving video progress:', err);
        }
    };

    const getVideoProgressFor = (videoId) => {
        const p = videoProgress.find(p => p.videoId === videoId);
        return p ? p.progress : 0;
    };

    // --- QUIZ HANDLERS ---
    const handleStartQuiz = async (quiz) => {
        try {
            const fullQuiz = await getQuiz(quiz.id);
            setActiveQuiz(fullQuiz);
            setQuizAnswers({});
            setQuizResult(null);
        } catch (err) {
            console.error('[CabinetEditor] Error loading quiz:', err);
            setError(t('Ошибка загрузки теста', 'Error loading quiz'));
        }
    };

    const handleQuizAnswer = (questionIdx, answer) => {
        setQuizAnswers(prev => ({ ...prev, [questionIdx]: answer }));
    };

    const handleSubmitQuiz = async () => {
        if (!activeQuiz || !userProfile?.uid) return;
        setQuizSubmitting(true);
        setError('');
        try {
            let correct = 0;
            const total = activeQuiz.questions?.length || 0;

            activeQuiz.questions.forEach((q, idx) => {
                if (q.type === 'multiple') {
                    if (quizAnswers[idx] === q.correctAnswer) correct++;
                }
            });

            const score = total > 0 ? Math.round((correct / total) * 100) : 0;

            await submitQuizAttempt(userProfile.uid, activeQuiz.id, quizAnswers, score);
            setQuizResult({ correct, total, score });

            const attempts = await getQuizAttemptsByUser(userProfile.uid);
            setQuizAttempts(attempts);
        } catch (err) {
            console.error('[CabinetEditor] Error submitting quiz:', err);
            setError(t('Ошибка отправки теста', 'Error submitting quiz'));
        } finally {
            setQuizSubmitting(false);
        }
    };

    // --- NOTE HANDLERS ---
    const handleSaveNote = async () => {
        if (!userProfile?.uid || !noteContent.trim()) return;
        setNoteSaving(true);
        setError('');
        try {
            if (editingNoteId) {
                await updateNote(editingNoteId, {
                    title: noteTitle.trim(),
                    content: noteContent.trim(),
                });
                setSuccess(t('Заметка обновлена', 'Note updated'));
                setEditingNoteId(null);
            } else {
                await createNote(userProfile.uid, {
                    title: noteTitle.trim(),
                    content: noteContent.trim(),
                });
                setSuccess(t('Заметка создана', 'Note created'));
            }
            setNoteTitle('');
            setNoteContent('');
            await refreshNotes();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('[CabinetEditor] Error saving note:', err);
            setError(t('Ошибка сохранения заметки', 'Error saving note'));
        } finally {
            setNoteSaving(false);
        }
    };

    const handleEditNote = (note) => {
        setNoteTitle(note.title || '');
        setNoteContent(note.content || '');
        setEditingNoteId(note.id);
    };

    const handleDeleteNote = async (noteId) => {
        setError('');
        try {
            await deleteNote(noteId);
            setSuccess(t('Заметка удалена', 'Note deleted'));
            await refreshNotes();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('[CabinetEditor] Error deleting note:', err);
            setError(t('Ошибка удаления заметки', 'Error deleting note'));
        }
    };

    const handleCancelEdit = () => {
        setNoteTitle('');
        setNoteContent('');
        setEditingNoteId(null);
    };

    const tabs = [
        { id: 'lessons', label: t('Видеоуроки', 'Video Lessons') },
        { id: 'resources', label: t('Ресурсы', 'Resources') },
        { id: 'quizzes', label: t('Тесты', 'Quizzes') },
        { id: 'notes', label: t('Заметки', 'Notes') },
    ];

    // --- RENDER: LESSONS ---
    const renderLessons = () => {
        if (selectedVideo) {
            return (
                <div className="cabinet-card">
                    <button
                        className="cabinet-btn secondary"
                        style={{ marginBottom: '16px' }}
                        onClick={() => setSelectedVideo(null)}
                    >
                        ← {t('Назад к урокам', 'Back to Lessons')}
                    </button>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {selectedVideo.title}
                    </h3>
                    {selectedVideo.description && (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            {selectedVideo.description}
                        </p>
                    )}
                    <div style={{
                        background: '#000',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                    }}>
                        <video
                            src={selectedVideo.videoURL}
                            controls
                            style={{ width: '100%', maxHeight: '500px' }}
                            onTimeUpdate={(e) => {
                                const video = e.target;
                                const progress = Math.round((video.currentTime / video.duration) * 100);
                                if (progress % 10 === 0) {
                                    handleVideoProgress(selectedVideo.id, progress);
                                }
                            }}
                        />
                    </div>
                    <div className="cabinet-progress">
                        <div className="cabinet-progress-header">
                            <span className="cabinet-progress-label">{t('Прогресс', 'Progress')}</span>
                            <span className="cabinet-progress-value">{getVideoProgressFor(selectedVideo.id)}%</span>
                        </div>
                        <div className="cabinet-progress-bar">
                            <div className="cabinet-progress-fill" style={{ width: `${getVideoProgressFor(selectedVideo.id)}%` }}></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (videosLoading) {
            return <div className="cabinet-card"><div className="cabinet-empty"><p>{t('Загрузка...', 'Loading...')}</p></div></div>;
        }

        if (videos.length === 0) {
            return (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <h3>{t('Видеоуроки', 'Video Lessons')}</h3>
                        <p>{t('Преподаватели ещё не загрузили видео', 'Teachers have not uploaded videos yet')}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="cabinet-grid cabinet-grid-3">
                {videos.map((video) => (
                    <div key={video.id} className="cabinet-card clickable" onClick={() => handleStartVideo(video)}>
                        <div style={{
                            height: '140px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {video.title}
                        </h4>
                        {video.description && (
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                {video.description.substring(0, 80)}...
                            </p>
                        )}
                        {video.subject && (
                            <span style={{
                                padding: '4px 8px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#3B82F6',
                            }}>
                                {video.subject}
                            </span>
                        )}
                        <div className="cabinet-progress" style={{ marginTop: '12px' }}>
                            <div className="cabinet-progress-header">
                                <span className="cabinet-progress-label">{t('Прогресс', 'Progress')}</span>
                                <span className="cabinet-progress-value">{getVideoProgressFor(video.id)}%</span>
                            </div>
                            <div className="cabinet-progress-bar">
                                <div className="cabinet-progress-fill" style={{ width: `${getVideoProgressFor(video.id)}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // --- RENDER: RESOURCES ---
    const renderResources = () => {
        if (resourcesLoading) {
            return <div className="cabinet-card"><div className="cabinet-empty"><p>{t('Загрузка...', 'Loading...')}</p></div></div>;
        }

        if (resources.length === 0) {
            return (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <h3>{t('Учебные ресурсы', 'Study Resources')}</h3>
                        <p>{t('Преподаватели ещё не загрузили ресурсы', 'Teachers have not uploaded resources yet')}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="cabinet-grid cabinet-grid-3">
                {resources.map((resource) => (
                    <div key={resource.id} className="cabinet-card">
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {resource.title}
                        </h4>
                        {resource.description && (
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                {resource.description}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            {resource.subject && (
                                <span style={{
                                    padding: '4px 8px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#8B5CF6',
                                }}>
                                    {resource.subject}
                                </span>
                            )}
                            {resource.category && (
                                <span style={{
                                    padding: '4px 8px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#10B981',
                                }}>
                                    {resource.category}
                                </span>
                            )}
                        </div>
                        {resource.fileURL && (
                            <a
                                href={resource.fileURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cabinet-btn"
                                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                            >
                                {t('Скачать', 'Download')}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // --- RENDER: QUIZZES ---
    const renderQuizzes = () => {
        if (activeQuiz) {
            if (quizResult) {
                return (
                    <div className="cabinet-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Результат теста', 'Quiz Result')}
                        </h3>
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                            <div style={{ fontSize: '48px', fontWeight: '800', color: quizResult.score >= 70 ? '#10B981' : '#EF4444', marginBottom: '16px' }}>
                                {quizResult.score}%
                            </div>
                            <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {quizResult.correct} {t('из', 'of')} {quizResult.total} {t('правильно', 'correct')}
                            </p>
                            <p style={{ fontSize: '14px', color: quizResult.score >= 70 ? '#10B981' : '#EF4444' }}>
                                {quizResult.score >= 70 ? t('Отлично!', 'Great!') : t('Попробуйте ещё раз', 'Try again')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="cabinet-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleStartQuiz(activeQuiz)}>
                                {t('Пройти заново', 'Retake')}
                            </button>
                            <button className="cabinet-btn secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setActiveQuiz(null); setQuizResult(null); }}>
                                {t('К списку тестов', 'Back to Quizzes')}
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="cabinet-card">
                    <button
                        className="cabinet-btn secondary"
                        style={{ marginBottom: '16px' }}
                        onClick={() => { setActiveQuiz(null); setQuizAnswers({}); setQuizResult(null); }}
                    >
                        ← {t('Назад', 'Back')}
                    </button>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {activeQuiz.title}
                    </h3>
                    {activeQuiz.description && (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {activeQuiz.description}
                        </p>
                    )}

                    {activeQuiz.questions?.map((q, qIdx) => (
                        <div key={qIdx} style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                                {qIdx + 1}. {q.text}
                            </h4>
                            {q.type === 'multiple' && q.options?.map((opt, optIdx) => (
                                <label key={optIdx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    marginBottom: '6px',
                                    background: quizAnswers[qIdx] === optIdx ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                }}>
                                    <input
                                        type="radio"
                                        name={`q-${qIdx}`}
                                        checked={quizAnswers[qIdx] === optIdx}
                                        onChange={() => handleQuizAnswer(qIdx, optIdx)}
                                        style={{ accentColor: 'var(--accent-secondary)' }}
                                    />
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{opt}</span>
                                </label>
                            ))}
                            {(q.type === 'short' || q.type === 'long') && (
                                <input
                                    className="cabinet-input"
                                    type="text"
                                    placeholder={t('Ваш ответ', 'Your answer')}
                                    value={quizAnswers[qIdx] || ''}
                                    onChange={(e) => handleQuizAnswer(qIdx, e.target.value)}
                                />
                            )}
                        </div>
                    ))}

                    <button
                        className="cabinet-btn"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={handleSubmitQuiz}
                        disabled={quizSubmitting || Object.keys(quizAnswers).length === 0}
                    >
                        {quizSubmitting ? t('Отправка...', 'Submitting...') : t('Отправить', 'Submit')}
                    </button>
                </div>
            );
        }

        if (quizzesLoading) {
            return <div className="cabinet-card"><div className="cabinet-empty"><p>{t('Загрузка...', 'Loading...')}</p></div></div>;
        }

        if (quizzes.length === 0) {
            return (
                <div className="cabinet-card">
                    <div className="cabinet-empty">
                        <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <h3>{t('Тесты и викторины', 'Tests & Quizzes')}</h3>
                        <p>{t('Преподаватели ещё не создали тесты', 'Teachers have not created quizzes yet')}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="cabinet-grid cabinet-grid-3">
                {quizzes.map((quiz) => {
                    const attempts = quizAttempts.filter(a => a.quizId === quiz.id);
                    return (
                        <div key={quiz.id} className="cabinet-card">
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {quiz.title}
                            </h4>
                            {quiz.description && (
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    {quiz.description}
                                </p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                <span>{quiz.totalQuestions || quiz.questions?.length || 0} {t('вопросов', 'questions')}</span>
                                <span>{attempts.length} {t('попыток', 'attempts')}</span>
                            </div>
                            {attempts.length > 0 && (
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    {t('Лучший результат', 'Best score')}: {Math.max(...attempts.map(a => a.score || 0))}%
                                </div>
                            )}
                            <button
                                className="cabinet-btn"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => handleStartQuiz(quiz)}
                            >
                                {t('Пройти тест', 'Take Quiz')}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- RENDER: NOTES ---
    const renderNotes = () => {
        return (
            <div>
                <div className="cabinet-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {editingNoteId ? t('Редактировать заметку', 'Edit Note') : t('Новая заметка', 'New Note')}
                    </h3>
                    <div style={{ marginBottom: '12px' }}>
                        <input
                            className="cabinet-input"
                            type="text"
                            placeholder={t('Заголовок', 'Title')}
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <textarea
                            className="cabinet-input"
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            placeholder={t('Содержание заметки...', 'Note content...')}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="cabinet-btn"
                            style={{ flex: 1, justifyContent: 'center' }}
                            onClick={handleSaveNote}
                            disabled={noteSaving || !noteContent.trim()}
                        >
                            {noteSaving ? t('Сохранение...', 'Saving...') : editingNoteId ? t('Обновить', 'Update') : t('Создать', 'Create')}
                        </button>
                        {editingNoteId && (
                            <button className="cabinet-btn secondary" onClick={handleCancelEdit}>
                                {t('Отмена', 'Cancel')}
                            </button>
                        )}
                    </div>
                </div>

                {notesLoading ? (
                    <div className="cabinet-card"><div className="cabinet-empty"><p>{t('Загрузка...', 'Loading...')}</p></div></div>
                ) : notes.length === 0 ? (
                    <div className="cabinet-card">
                        <div className="cabinet-empty">
                            <svg className="cabinet-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <h3>{t('Нет заметок', 'No notes')}</h3>
                            <p>{t('Создайте свою первую заметку', 'Create your first note')}</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {notes.map((note) => (
                            <div key={note.id} style={{
                                padding: '16px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                            {note.title || t('Без заголовка', 'Untitled')}
                                        </h4>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                                            {note.content}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                                        <button
                                            className="cabinet-btn secondary"
                                            style={{ padding: '4px 12px', fontSize: '12px' }}
                                            onClick={() => handleEditNote(note)}
                                        >
                                            {t('Изменить', 'Edit')}
                                        </button>
                                        <button
                                            className="cabinet-btn secondary"
                                            style={{ padding: '4px 12px', fontSize: '12px', color: '#EF4444' }}
                                            onClick={() => handleDeleteNote(note.id)}
                                        >
                                            {t('Удалить', 'Delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Редактор обучения', 'Learning Workspace')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Ваша персональная учебная студия', 'Your personal study studio')}
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

            {activeTab === 'lessons' && renderLessons()}
            {activeTab === 'resources' && renderResources()}
            {activeTab === 'quizzes' && renderQuizzes()}
            {activeTab === 'notes' && renderNotes()}
        </CabinetLayout>
    );
}
