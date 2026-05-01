import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';

export default function TeacherStudents() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeTab, setActiveTab] = useState('enrolled');

    const tabs = [
        { id: 'enrolled', label: t('Зачисленные', 'Enrolled') },
        { id: 'followers', label: t('Подписчики', 'Followers') },
        { id: 'buyers', label: t('Покупатели', 'Buyers') },
        { id: 'questions', label: t('Вопросы', 'Questions') },
    ];

    return (
        <TeacherLayout>
            <div className="teacher-header">
                <div className="teacher-header-top">
                    <div>
                        <h1>{t('Управление учениками', 'Student Management')}</h1>
                        <p className="teacher-header-subtitle">
                            {t('Управляйте студентами, подписчиками и покупателями', 'Manage students, followers, and buyers')}
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

            {activeTab === 'enrolled' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Зачисленные студенты', 'Enrolled Students')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <h3>{t('Нет зачисленных студентов', 'No enrolled students')}</h3>
                        <p>{t('Студенты, записанные на ваши курсы, появятся здесь', 'Students enrolled in your courses will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'followers' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Подписчики', 'Followers')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        <h3>{t('Нет подписчиков', 'No followers')}</h3>
                        <p>{t('Ваши подписчики появятся здесь', 'Your followers will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'buyers' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Покупатели', 'Buyers')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <h3>{t('Нет покупателей', 'No buyers')}</h3>
                        <p>{t('Покупатели ваших курсов и ресурсов появятся здесь', 'Buyers of your courses and resources will appear here')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="teacher-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        {t('Вопросы студентов', 'Student Questions')}
                    </h3>
                    <div className="teacher-empty">
                        <svg className="teacher-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <h3>{t('Нет вопросов', 'No questions')}</h3>
                        <p>{t('Вопросы от студентов появятся здесь', 'Questions from students will appear here')}</p>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
