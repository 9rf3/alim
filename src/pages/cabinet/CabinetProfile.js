import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CabinetLayout from '../../components/cabinet/CabinetLayout';
import PhotoUpload from '../../components/profile/PhotoUpload';
import EditProfileModal from '../../components/profile/EditProfileModal';
import GoalsPlanner from '../../components/profile/GoalsPlanner';
import ActivityHeatmap from '../../components/profile/ActivityHeatmap';
import ReviewsSection from '../../components/profile/ReviewsSection';
import { subjects } from '../../data/subjects';
import '../../styles/profile.css';

export default function CabinetProfile() {
    const { language } = useLanguage();
    const { userProfile, firebaseUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (!userProfile) {
            navigate('/signin');
        }
    }, [userProfile, navigate]);

    if (!userProfile) return null;

    const t = (ru, en) => language === 'ru' ? ru : en;
    const displayName = userProfile.fullName || firebaseUser?.displayName || 'User';
    const role = userProfile.role;

    const profileSubjects = role === 'teacher'
        ? (userProfile.subjectsToTeach || [])
        : (userProfile.subjectsToStudy || []);

    const completionFields = [
        !!displayName,
        !!userProfile.age,
        !!userProfile.bio,
        profileSubjects.length > 0,
        role === 'teacher' ? !!userProfile.teachingGoalsMonth : !!userProfile.learningGoalMonth,
        role === 'teacher' ? !!userProfile.teachingGoalsYear : !!userProfile.learningGoalYear,
        role === 'teacher' ? !!userProfile.coursePrice : true,
        role === 'teacher' ? !!userProfile.experience : true,
    ];
    const filledCount = completionFields.filter(Boolean).length;
    const completionPercent = Math.round((filledCount / completionFields.length) * 100);

    const tabs = [
        { id: 'overview', label: t('Обзор', 'Overview'), icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        )},
        { id: 'goals', label: t('Цели', 'Goals'), icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        )},
        { id: 'reviews', label: t('Отзывы', 'Reviews'), icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        )},
        { id: 'activity', label: t('Активность', 'Activity'), icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
        )},
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <h1>{t('Профиль', 'Profile')}</h1>
            </div>

            <div className="profile-header" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '24px' }}>
                <div className="profile-header-content">
                    <PhotoUpload />

                    <div className="profile-info">
                        <div className="profile-name-row">
                            <h1 className="profile-name">{displayName}</h1>
                            <span className={`profile-role-badge ${role}`}>
                                {role === 'student' ? t('Ученик', 'Student') : t('Учитель', 'Teacher')}
                            </span>
                        </div>

                        <div className="profile-meta">
                            {firebaseUser?.email && (
                                <div className="profile-meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    {firebaseUser.email}
                                </div>
                            )}
                            {userProfile.age && (
                                <div className="profile-meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    {userProfile.age} {t('лет', 'yrs')}
                                </div>
                            )}
                        </div>

                        <div className="profile-actions">
                            <button className="profile-btn primary" onClick={() => setShowEditModal(true)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                {t('Редактировать', 'Edit Profile')}
                            </button>
                        </div>

                        <div className="profile-completion">
                            <div className="completion-header">
                                <span className="completion-label">{t('Завершённость профиля', 'Profile Completion')}</span>
                                <span className="completion-percentage">{completionPercent}%</span>
                            </div>
                            <div className="completion-bar">
                                <div className="completion-fill" style={{ width: `${completionPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="cabinet-grid cabinet-grid-2">
                    <div className="cabinet-card">
                        <h3 className="cabinet-card-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '8px', verticalAlign: 'middle' }}>
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4"/>
                                <path d="M12 8h.01"/>
                            </svg>
                            {t('О себе', 'About Me')}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                            {userProfile.bio || t('Информация не добавлена', 'No bio added yet')}
                        </p>
                        {role === 'teacher' && userProfile.experience && (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                    {t('Опыт преподавания', 'Teaching Experience')}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{userProfile.experience}</div>
                            </div>
                        )}
                        {role === 'teacher' && userProfile.availability && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                    {t('Доступность', 'Availability')}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{userProfile.availability}</div>
                            </div>
                        )}
                    </div>

                    <div className="cabinet-card">
                        <h3 className="cabinet-card-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '8px', verticalAlign: 'middle' }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                            {role === 'teacher' ? t('Предметы преподавания', 'Teaching Subjects') : t('Предметы изучения', 'Study Subjects')}
                        </h3>
                        <div className="subjects-grid" style={{ marginTop: '12px' }}>
                            {profileSubjects.length > 0 ? (
                                profileSubjects.map(id => {
                                    const subject = subjects.find(s => s.id === id);
                                    if (!subject) return null;
                                    return (
                                        <div key={id} className="subject-badge">
                                            <span className="subject-badge-icon">{subject.icon}</span>
                                            <span>{language === 'ru' ? subject.ru : subject.en}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                    {t('Предметы не выбраны', 'No subjects selected')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'goals' && <GoalsPlanner />}
            {activeTab === 'reviews' && <ReviewsSection />}
            {activeTab === 'activity' && <ActivityHeatmap />}

            {showEditModal && (
                <EditProfileModal onClose={() => setShowEditModal(false)} />
            )}
        </CabinetLayout>
    );
}