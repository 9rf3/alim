import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherQuiz() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('builder');
    const [questionType, setQuestionType] = useState('multiple');

    const tabs = [
        { id: 'builder', label: t('Создать квиз', 'Create Quiz') },
        { id: 'my', label: t('Мои квизы', 'My Quizzes') },
        { id: 'results', label: t('Результаты', 'Results') },
    ];

    const questionTypes = [
        { id: 'multiple', label: t('Выбор ответа', 'Multiple Choice') },
        { id: 'checkbox', label: t('Несколько ответов', 'Checkbox') },
        { id: 'short', label: t('Краткий ответ', 'Short Answer') },
        { id: 'long', label: t('Развёрнутый ответ', 'Long Answer') },
        { id: 'matching', label: t('Соответствие', 'Matching') },
        { id: 'formula', label: t('Формула/Математика', 'Formula/Math') },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Инструменты квизов', 'Quiz Tools')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Создавайте тесты с автопроверкой и AI-помощником', 'Create quizzes with auto-grading and AI helper')}
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

                        <div style={{ marginBottom: '16px' }}>
                            <label className="teacher-label">{t('Название квиза', 'Quiz Title')}</label>
                            <input className="teacher-input" placeholder={t('Например: Тест по органической химии', 'e.g., Organic Chemistry Test')} />
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
                            <textarea className="teacher-textarea" placeholder={t('Введите вопрос...', 'Enter question...')} style={{ minHeight: '80px' }} />
                        </div>

                        {(questionType === 'multiple' || questionType === 'checkbox') && (
                            <div style={{ marginBottom: '16px' }}>
                                <label className="teacher-label">{t('Варианты ответов', 'Answer Options')}</label>
                                {['A', 'B', 'C', 'D'].map((opt) => (
                                    <div key={opt} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type={questionType === 'multiple' ? 'radio' : 'checkbox'}
                                            name="correct-answer"
                                            style={{ accentColor: 'var(--accent-secondary)' }}
                                        />
                                        <input className="teacher-input" placeholder={`${t('Вариант', 'Option')} ${opt}`} style={{ flex: 1 }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="teacher-btn secondary" style={{ flex: 1, justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                                {t('AI Генерация', 'AI Generate')}
                            </button>
                            <button className="teacher-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                {t('Добавить вопрос', 'Add Question')}
                            </button>
                        </div>
                    </div>

                    <div className="teacher-card">
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            {t('Предпросмотр', 'Preview')}
                        </h3>
                        <div className="teacher-empty">
                            <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            <h3>{t('Предпросмотр квиза', 'Quiz Preview')}</h3>
                            <p>{t('Добавьте вопросы, чтобы увидеть предпросмотр', 'Add questions to see preview')}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'my' && (
                <div className="teacher-card">
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        </svg>
                        <h3>{t('Нет созданных квизов', 'No quizzes created')}</h3>
                        <p>{t('Создайте свой первый тест для студентов', 'Create your first test for students')}</p>
                        <button className="teacher-btn">{t('Создать квиз', 'Create Quiz')}</button>
                    </div>
                </div>
            )}

            {activeTab === 'results' && (
                <div className="teacher-card">
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        <h3>{t('Нет результатов', 'No results')}</h3>
                        <p>{t('Результаты тестов студентов появятся здесь', 'Student test results will appear here')}</p>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
