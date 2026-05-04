import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { createQuiz, getQuizzesByTeacher, getCoursesByTeacher } from '../../services/firestore';

export default function TeacherQuiz() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('builder');
    const [questionType, setQuestionType] = useState('multiple');

    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizCourse, setQuizCourse] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile?.uid) return;
        let isMounted = true;

        const loadData = async () => {
            try {
                const [quizzesData, coursesData] = await Promise.all([
                    getQuizzesByTeacher(userProfile.uid),
                    getCoursesByTeacher(userProfile.uid),
                ]);
                if (!isMounted) return;
                setQuizzes(quizzesData);
                setCourses(coursesData);
            } catch (error) {
                console.error('[TeacherQuiz] Error loading:', error);
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
            const [quizzesData, coursesData] = await Promise.all([
                getQuizzesByTeacher(userProfile.uid),
                getCoursesByTeacher(userProfile.uid),
            ]);
            setQuizzes(quizzesData);
            setCourses(coursesData);
        } catch (error) {
            console.error('[TeacherQuiz] Refresh error:', error);
        }
    };

    const addQuestion = () => {
        if (!currentQuestion.trim()) return;

        if ((questionType === 'multiple' || questionType === 'checkbox') && options.filter(o => o.trim()).length < 2) {
            setSaveError(language === 'ru' ? 'Добавьте минимум 2 варианта ответа' : 'Add at least 2 answer options');
            return;
        }

        const newQuestion = {
            id: Date.now(),
            type: questionType,
            text: currentQuestion.trim(),
            options: questionType === 'multiple' || questionType === 'checkbox' ? options.filter(o => o.trim()) : [],
            correctAnswer: questionType === 'multiple' ? correctAnswer : null,
            correctAnswers: questionType === 'checkbox' ? [correctAnswer] : null,
        };

        setQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestion('');
        setOptions(['', '', '', '']);
        setCorrectAnswer(0);
        setSaveError('');
    };

    const removeQuestion = (questionId) => {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
    };

    const handleCreateQuiz = async () => {
        if (!quizTitle.trim() || questions.length === 0) {
            setSaveError(language === 'ru' ? 'Введите название и добавьте вопросы' : 'Enter a title and add questions');
            return;
        }

        setSaving(true);
        setSaveError('');

        try {
            await createQuiz(userProfile.uid, {
                title: quizTitle.trim(),
                description: quizDescription.trim(),
                courseId: quizCourse,
                questions,
                totalQuestions: questions.length,
            });

            await refreshData();

            setQuizTitle('');
            setQuizDescription('');
            setQuizCourse('');
            setQuestions([]);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('[TeacherQuiz] Create error:', error);
            setSaveError(error.message || (language === 'ru' ? 'Ошибка создания квиза' : 'Failed to create quiz'));
        } finally {
            setSaving(false);
        }
    };

    const deleteQuiz = async (quizId) => {
        try {
            const { deleteDocument } = await import('../../services/firestore');
            await deleteDocument('quizzes', quizId);
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
        } catch (error) {
            console.error('[TeacherQuiz] Delete error:', error);
        }
    };

    const tabs = [
        { id: 'builder', label: t('Создать квиз', 'Create Quiz') },
        { id: 'my', label: t('Мои квизы', 'My Quizzes') },
        { id: 'results', label: t('Результаты', 'Results') },
    ];

    const questionTypes = [
        { id: 'multiple', label: t('Выбор ответа', 'Multiple Choice') },
        { id: 'short', label: t('Краткий ответ', 'Short Answer') },
        { id: 'long', label: t('Развёрнутый ответ', 'Long Answer') },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Инструменты квизов', 'Quiz Tools')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Создавайте тесты с автопроверкой', 'Create quizzes with auto-grading')}
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

            {activeTab === 'builder' && (
                <div className="teacher-grid teacher-grid-2">
                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Создание квиза', 'Quiz Builder')}
                        </h3>

                        {saveError && <div className="teacher-error">{saveError}</div>}
                        {saveSuccess && (
                            <div className="teacher-success">
                                {language === 'ru' ? 'Квиз успешно создан!' : 'Quiz created successfully!'}
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Название квиза', 'Quiz Title')}</label>
                            <input
                                className="teacher-input"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                placeholder={t('Например: Тест по органической химии', 'e.g., Organic Chemistry Test')}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Описание', 'Description')}</label>
                            <textarea
                                className="teacher-textarea"
                                value={quizDescription}
                                onChange={(e) => setQuizDescription(e.target.value)}
                                placeholder={t('Описание квиза...', 'Quiz description...')}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Курс', 'Course')}</label>
                            <select className="teacher-select" value={quizCourse} onChange={(e) => setQuizCourse(e.target.value)}>
                                <option value="">{t('Все курсы', 'All courses')}</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Тип вопроса', 'Question Type')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {questionTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setQuestionType(type.id)}
                                        style={{
                                            padding: '8px',
                                            background: questionType === type.id ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)',
                                            border: questionType === type.id ? '1px solid var(--accent-secondary)' : '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            color: questionType === type.id ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Вопрос', 'Question')}</label>
                            <textarea
                                className="teacher-textarea"
                                value={currentQuestion}
                                onChange={(e) => setCurrentQuestion(e.target.value)}
                                placeholder={t('Введите вопрос...', 'Enter question...')}
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        {questionType === 'multiple' && (
                            <div style={{ marginBottom: '16px' }}>
                                <label className="teacher-label">{t('Варианты ответов', 'Answer Options')}</label>
                                {options.map((opt, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name="correct-answer"
                                            checked={correctAnswer === idx}
                                            onChange={() => setCorrectAnswer(idx)}
                                            style={{ accentColor: 'var(--accent-secondary)' }}
                                        />
                                        <input
                                            className="teacher-input"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...options];
                                                newOpts[idx] = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            placeholder={`${t('Вариант', 'Option')} ${String.fromCharCode(65 + idx)}`}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="teacher-btn secondary" onClick={addQuestion} style={{ marginBottom: 16, width: '100%', justifyContent: 'center' }}>
                            {t('Добавить вопрос', 'Add Question')} ({questions.length})
                        </button>

                        {questions.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <h4 style={{ marginBottom: 8 }}>{t('Добавленные вопросы', 'Added Questions')}</h4>
                                {questions.map((q, idx) => (
                                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 4 }}>
                                        <span>{idx + 1}. {q.text.substring(0, 60)}...</span>
                                        <button onClick={() => removeQuestion(q.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className="teacher-btn primary"
                            onClick={handleCreateQuiz}
                            disabled={saving || !quizTitle || questions.length === 0}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {saving ? (language === 'ru' ? 'Сохранение...' : 'Saving...') : t('Создать квиз', 'Create Quiz')}
                        </button>
                    </div>

                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Предпросмотр', 'Preview')}
                        </h3>
                        {questions.length > 0 ? (
                            <div className="quiz-preview">
                                <h4>{quizTitle || t('Без названия', 'Untitled')}</h4>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{questions.length} questions</p>
                                {questions.map((q, idx) => (
                                    <div key={q.id} className="quiz-preview-question">
                                        <h5>{idx + 1}. {q.text}</h5>
                                        {q.options.length > 0 && (
                                            <div style={{ paddingLeft: 16 }}>
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} style={{ padding: 4, color: optIdx === q.correctAnswer ? '#10B981' : 'var(--text-secondary)' }}>
                                                        {optIdx === q.correctAnswer ? '✓' : '○'} {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="teacher-empty">
                                <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                                <h3>{t('Предпросмотр квиза', 'Quiz Preview')}</h3>
                                <p>{t('Добавьте вопросы, чтобы увидеть предпросмотр', 'Add questions to see preview')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'my' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Мои квизы', 'My Quizzes')} ({quizzes.length})
                    </h3>
                    {loading ? (
                        <div className="teacher-loading"><div className="loading-spinner"></div></div>
                    ) : quizzes.length > 0 ? (
                        <div className="quiz-list">
                            {quizzes.map(quiz => (
                                <div key={quiz.id} className="quiz-item">
                                    <div className="quiz-item-info">
                                        <h4>{quiz.title}</h4>
                                        <p>{quiz.description?.substring(0, 80)}</p>
                                        <div className="quiz-meta">
                                            <span>{quiz.totalQuestions || quiz.questions?.length || 0} questions</span>
                                            <span>{quiz.attempts || 0} attempts</span>
                                            {quiz.avgScore !== undefined && <span>Avg: {quiz.avgScore}%</span>}
                                        </div>
                                    </div>
                                    <button className="video-btn delete" onClick={() => deleteQuiz(quiz.id)}>
                                        {t('Удалить', 'Delete')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                            </svg>
                            <h3>{t('Нет созданных квизов', 'No quizzes created')}</h3>
                            <p>{t('Создайте свой первый тест для студентов', 'Create your first test for students')}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'results' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Результаты', 'Results')}
                    </h3>
                    {quizzes.length > 0 ? (
                        <div className="results-summary">
                            {quizzes.map(quiz => (
                                <div key={quiz.id} className="result-item">
                                    <h4>{quiz.title}</h4>
                                    <div className="result-stats">
                                        <div className="result-stat">
                                            <span className="result-value">{quiz.attempts || 0}</span>
                                            <span className="result-label">{t('Попыток', 'Attempts')}</span>
                                        </div>
                                        <div className="result-stat">
                                            <span className="result-value">{quiz.avgScore || 0}%</span>
                                            <span className="result-label">{t('Средний балл', 'Avg Score')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="teacher-empty">
                            <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                            <h3>{t('Нет результатов', 'No results')}</h3>
                            <p>{t('Результаты тестов студентов появятся здесь', 'Student test results will appear here')}</p>
                        </div>
                    )}
                </div>
            )}
        </TeacherLayout>
    );
}
