import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PhotoUpload from '../components/profile/PhotoUpload';
import EditProfileModal from '../components/profile/EditProfileModal';
import GoalsPlanner from '../components/profile/GoalsPlanner';
import ActivityHeatmap from '../components/profile/ActivityHeatmap';
import ReviewsSection from '../components/profile/ReviewsSection';
import { subjects, getSubjectName } from '../data/subjects';
import '../styles/main.css';
import '../styles/profile.css';

export default function Profile() {
    const { language } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        const stored = localStorage.getItem('userProfile');
        if (stored) {
            setProfile(JSON.parse(stored));
        }
        const storedPhoto = localStorage.getItem('userPhoto');
        if (storedPhoto) {
            setPhotoUrl(storedPhoto);
        }
    }, [user, navigate]);

    if (!user) return null;

    const t = (ru, en) => language === 'ru' ? ru : en;
    const displayPhoto = photoUrl || user.photoURL;

    const profileSubjects = user.role === 'teacher'
        ? (profile?.subjectsToTeach || [])
        : (profile?.subjectsToStudy || []);

    const completionItems = [
        !!user.displayName,
        !!profile?.age,
        !!profile?.bio,
        profileSubjects.length > 0,
        !!profile?.learningGoalMonth || !!profile?.teachingGoalsMonth,
        !!profile?.learningGoalYear || !!profile?.teachingGoalsYear,
        user.role === 'teacher' ? !!profile?.coursePrice : true,
        user.role === 'teacher' ? !!profile?.experience : true,
    ].filter(Boolean).length;

    const completionPercent = Math.round((completionItems / completionItems.length) * 100);

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

    const renderContent = () => {
        switch (activeTab) {
            case 'goals':
                return <GoalsPlanner />;
            case 'reviews':
                return <ReviewsSection />;
            case 'activity':
                return <ActivityHeatmap />;
            default:
                return (
                    <>
                        <div className="profile-stats-row">
                            <div className="stat-card">
                                <div className="stat-card-icon blue">📚</div>
                                <div className="stat-card-value">{profileSubjects.length}</div>
                                <div className="stat-card-label">{user.role === 'teacher' ? t('Предметов', 'Subjects') : t('Предметов', 'Subjects')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon purple">🎯</div>
                                <div className="stat-card-value">{completionPercent}%</div>
                                <div className="stat-card-label">{t('Профиль', 'Profile Complete')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon green">📅</div>
                                <div className="stat-card-value">{profile?.age || '—'}</div>
                                <div className="stat-card-label">{t('Возраст', 'Age')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon orange">⭐</div>
                                <div className="stat-card-value">4.8</div>
                                <div className="stat-card-label">{t('Рейтинг', 'Rating')}</div>
                            </div>
                        </div>

                        <div className="profile-section">
                            <div className="profile-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4"/>
                                    <path d="M12 8h.01"/>
                                </svg>
                                {t('О себе', 'About Me')}
                            </div>
                            <div className="profile-section-subtitle">
                                {profile?.bio || t('Информация не добавлена', 'No bio added yet')}
                            </div>

                            {user.role === 'teacher' && profile?.experience && (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
                                        {t('Опыт преподавания', 'Teaching Experience')}
                                    </div>
                                    <div style={{ fontSize: 15, color: '#cbd5e1' }}>
                                        {profile.experience}
                                    </div>
                                </div>
                            )}

                            {user.role === 'teacher' && profile?.availability && (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
                                        {t('Доступность', 'Availability')}
                                    </div>
                                    <div style={{ fontSize: 15, color: '#cbd5e1' }}>
                                        {profile.availability}
                                    </div>
                                </div>
                            )}

                            {user.role === 'teacher' && profile?.coursePrice && (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
                                        {t('Стоимость курсов', 'Course Pricing')}
                                    </div>
                                    <div style={{ fontSize: 15, color: '#cbd5e1' }}>
                                        {profile.coursePrice}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile-section">
                            <div className="profile-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                                {user.role === 'teacher'
                                    ? t('Предметы преподавания', 'Teaching Subjects')
                                    : t('Предметы изучения', 'Study Subjects')
                                }
                            </div>
                            <div className="profile-section-subtitle">
                                {user.role === 'teacher'
                                    ? t('Предметы, которые вы преподаёте', 'Subjects you teach')
                                    : t('Предметы, которые вы изучаете', 'Subjects you study')
                                }
                            </div>
                            <div className="subjects-grid">
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
                                    <span className="subjects-empty">
                                        {t('Предметы не выбраны', 'No subjects selected')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="profile-section">
                            <div className="profile-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                {t('Достижения', 'Achievements')}
                            </div>
                            <div className="achievements-grid">
                                <div className="achievement-card">
                                    <div className="achievement-icon">🎓</div>
                                    <div className="achievement-name">{t('Первый шаг', 'First Step')}</div>
                                    <div className="achievement-desc">{t('Завершите регистрацию', 'Complete registration')}</div>
                                </div>
                                {profileSubjects.length >= 3 && (
                                    <div className="achievement-card">
                                        <div className="achievement-icon">📚</div>
                                        <div className="achievement-name">{t('Полиглот', 'Polymath')}</div>
                                        <div className="achievement-desc">{t('3+ предмета', '3+ subjects')}</div>
                                    </div>
                                )}
                                {completionPercent >= 80 && (
                                    <div className="achievement-card">
                                        <div className="achievement-icon">⭐</div>
                                        <div className="achievement-name">{t('Профи', 'Pro')}</div>
                                        <div className="achievement-desc">{t('80%+ профиля', '80%+ profile')}</div>
                                    </div>
                                )}
                                <div className={`achievement-card ${completionPercent < 100 ? 'locked' : ''}`}>
                                    <div className="achievement-icon">🏆</div>
                                    <div className="achievement-name">{t('Мастер', 'Master')}</div>
                                    <div className="achievement-desc">{t('100% профиля', '100% profile')}</div>
                                </div>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="profile-page">
            <Navbar />

            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <PhotoUpload onPhotoChange={(url) => setPhotoUrl(url)} />

                        <div className="profile-info">
                            <div className="profile-name-row">
                                <h1 className="profile-name">{user.displayName || t('Пользователь', 'User')}</h1>
                                <span className={`profile-role-badge ${user.role}`}>
                                    {user.role === 'student' ? t('Ученик', 'Student') : t('Учитель', 'Teacher')}
                                </span>
                            </div>

                            <div className="profile-meta">
                                {user.email && (
                                    <div className="profile-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                        {user.email}
                                    </div>
                                )}
                                {profile?.age && (
                                    <div className="profile-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        {profile.age} {t('лет', 'years old')}
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
                                <button className="profile-btn secondary" onClick={() => navigate('/dashboard')}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7"/>
                                        <rect x="14" y="3" width="7" height="7"/>
                                        <rect x="14" y="14" width="7" height="7"/>
                                        <rect x="3" y="14" width="7" height="7"/>
                                    </svg>
                                    {t('Дашборд', 'Dashboard')}
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

                <div className="profile-tabs">
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

                {renderContent()}
            </div>

            {showEditModal && (
                <EditProfileModal onClose={() => setShowEditModal(false)} />
            )}
        </div>
    );
}
